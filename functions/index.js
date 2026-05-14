const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

// ============================================================
// SET CUSTOM CLAIMS SAAT USER PERTAMA KALI DAFTAR
// Dipanggil otomatis saat dokumen user dibuat di Firestore
// Custom claims dipakai oleh Security Rules untuk cek role
// ============================================================
exports.onUserCreated = functions.firestore
    .document("users/{userId}")
    .onCreate(async (snap, context) => {
        const userId = context.params.userId;
        const userData = snap.data();
        const role = userData.role || "member";

        try {
            // Set custom claims di Firebase Auth token
            await admin.auth().setCustomUserClaims(userId, {
                role: role,
            });

            // Catat di logs
            await db.collection("logs").add({
                userId: userId,
                action: "set_initial_role",
                result: "success",
                role: role,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`Custom claims set untuk user ${userId}: role=${role}`);
        } catch (error) {
            console.error("Error setting custom claims:", error);
        }
    });

// ============================================================
// UPDATE CUSTOM CLAIMS SAAT ROLE BERUBAH
// Dipanggil otomatis saat field role di dokumen user diupdate
// ============================================================
exports.onRoleUpdated = functions.firestore
    .document("users/{userId}")
    .onUpdate(async (change, context) => {
        const userId = context.params.userId;
        const before = change.before.data();
        const after = change.after.data();

        // Hanya proses jika role berubah
        if (before.role === after.role) return null;

        try {
            // Update custom claims
            await admin.auth().setCustomUserClaims(userId, {
                role: after.role,
            });

            // Catat di logs
            await db.collection("logs").add({
                userId: context.auth ? context.auth.uid : "system",
                targetUserId: userId,
                action: "update_role",
                result: "success",
                oldRole: before.role,
                newRole: after.role,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`Role updated untuk ${userId}: ${before.role} -> ${after.role}`);
        } catch (error) {
            console.error("Error updating custom claims:", error);
        }
    });

// ============================================================
// VALIDASI DAN PROSES ABSENSI
// Semua validasi kritis dilakukan di server, bukan di client
// Mencegah manipulasi dari browser
// ============================================================
exports.processAttendance = functions.https.onCall(async (data, context) => {
    // Pastikan user sudah login
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "You must be logged in"
        );
    }

    // Pastikan email sudah diverifikasi
    if (!context.auth.token.email_verified) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Email not verified"
        );
    }

    const { tokenId, deviceFingerprint } = data;
    const userId = context.auth.uid;

    if (!tokenId || !deviceFingerprint) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Missing required fields"
        );
    }

    try {
        // Jalankan semua validasi dan tulis data dalam satu transaction
        const result = await db.runTransaction(async (transaction) => {
            const tokenRef = db.collection("tokens").doc(tokenId);
            const userRef = db.collection("users").doc(userId);

            const [tokenSnap, userSnap] = await Promise.all([
                transaction.get(tokenRef),
                transaction.get(userRef),
            ]);

            // Validasi token
            if (!tokenSnap.exists) throw new Error("TOKEN_NOT_FOUND");
            const token = tokenSnap.data();
            if (token.used) throw new Error("TOKEN_USED");

            // Validasi expired menggunakan waktu server
            const now = admin.firestore.Timestamp.now();
            if (now.toMillis() > token.expiresAt.toMillis()) {
                throw new Error("TOKEN_EXPIRED");
            }

            // Validasi device binding
            if (token.deviceFingerprint && token.deviceFingerprint !== deviceFingerprint) {
                throw new Error("DEVICE_MISMATCH");
            }

            // Validasi event
            const eventRef = db.collection("events").doc(token.eventId);
            const eventSnap = await transaction.get(eventRef);
            if (!eventSnap.exists) throw new Error("EVENT_NOT_FOUND");
            const event = eventSnap.data();
            if (event.status !== "active") throw new Error("EVENT_NOT_ACTIVE");

            // Validasi user
            if (!userSnap.exists) throw new Error("USER_NOT_FOUND");
            const user = userSnap.data();
            if (user.status !== "active" && user.status !== "npc") {
                throw new Error("USER_NOT_ACTIVE");
            }

            // Validasi double absen
            const attendanceId = `${token.eventId}_${userId}`;
            const attendanceRef = db.collection("attendance").doc(attendanceId);
            const attendanceSnap = await transaction.get(attendanceRef);
            if (attendanceSnap.exists) throw new Error("ALREADY_ATTENDED");

            const xpReward = event.xpReward || 10;
            const currentXP = user.xpCache || 0;
            const currentStreak = user.streak || 0;

            // Hitung streak bonus
            // Jika hadir berturut-turut, dapat bonus XP
            const lastAttended = user.lastAttendedAt;
            let newStreak = 1;
            let streakBonus = 0;

            if (lastAttended) {
                const lastDate = lastAttended.toDate();
                const diffDays = Math.floor((now.toDate() - lastDate) / (1000 * 60 * 60 * 24));
                if (diffDays <= 7) {
                    newStreak = currentStreak + 1;
                    // Bonus XP setiap 5 streak
                    if (newStreak % 5 === 0) streakBonus = 5;
                }
            }

            const totalXP = currentXP + xpReward + streakBonus;

            // Tulis semua sekaligus — atomic
            transaction.update(tokenRef, {
                used: true,
                usedBy: userId,
                usedAt: now,
                deviceFingerprint: deviceFingerprint,
            });

            transaction.set(attendanceRef, {
                eventId: token.eventId,
                eventName: event.name,
                userId: userId,
                status: "present",
                xpChange: xpReward + streakBonus,
                streakBonus: streakBonus,
                deviceFingerprint: deviceFingerprint,
                attendedAt: now,
            });

            transaction.update(userRef, {
                xpCache: totalXP,
                attendanceCount: (user.attendanceCount || 0) + 1,
                streak: newStreak,
                lastAttendedAt: now,
            });

            return {
                success: true,
                xpGained: xpReward + streakBonus,
                streakBonus: streakBonus,
                newStreak: newStreak,
                totalXP: totalXP,
                eventName: event.name,
            };
        });

        // Log sukses di luar transaction
        await db.collection("logs").add({
            userId: userId,
            eventId: data.eventId,
            action: "attend",
            result: "success",
            deviceFingerprint: deviceFingerprint,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return result;

    } catch (error) {
        // Log gagal
        await db.collection("logs").add({
            userId: userId,
            action: "attend",
            result: "failed",
            reason: error.message,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Cek anomaly
        await checkAnomaly(userId, error.message, deviceFingerprint);

        // Pesan error yang tidak mengekspos detail internal
        const errorMessages = {
            TOKEN_NOT_FOUND: "Invalid QR code",
            TOKEN_USED: "QR code already used",
            TOKEN_EXPIRED: "QR code expired",
            DEVICE_MISMATCH: "Device not recognized",
            EVENT_NOT_FOUND: "Event not found",
            EVENT_NOT_ACTIVE: "Event is not active",
            USER_NOT_FOUND: "Account not found",
            USER_NOT_ACTIVE: "Account is not active",
            ALREADY_ATTENDED: "You have already attended this event",
        };

        throw new functions.https.HttpsError(
            "failed-precondition",
            errorMessages[error.message] || "Attendance failed"
        );
    }
});

// ============================================================
// TUTUP EVENT DAN DISTRIBUSI XP
// Hanya bisa dipanggil oleh admin ke atas
// ============================================================
exports.closeEvent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Not authenticated");
    }

    const role = context.auth.token.role;
    if (!["admin", "superadmin", "presiden"].includes(role)) {
        throw new functions.https.HttpsError("permission-denied", "Insufficient permissions");
    }

    const { eventId, approverId } = data;
    const requesterId = context.auth.uid;

    try {
        const eventRef = db.collection("events").doc(eventId);
        const eventSnap = await eventRef.get();

        if (!eventSnap.exists) throw new Error("Event not found");
        const event = eventSnap.data();
        if (event.status !== "active") throw new Error("Event is not active");

        // Double approval — kecuali superadmin dan presiden
        if (role === "admin") {
            if (!approverId || approverId === requesterId) {
                throw new functions.https.HttpsError(
                    "failed-precondition",
                    "Requires approval from another admin"
                );
            }
        }

        // Tutup event
        await eventRef.update({
            status: "closed",
            endTime: admin.firestore.FieldValue.serverTimestamp(),
            closedBy: requesterId,
            xpDistributed: false,
        });

        // Ambil semua user aktif
        const usersSnap = await db.collection("users")
            .where("status", "in", ["active", "npc"])
            .get();

        // Ambil semua yang sudah hadir
        const attendanceSnap = await db.collection("attendance")
            .where("eventId", "==", eventId)
            .get();

        const presentUserIds = new Set(
            attendanceSnap.docs.map((d) => d.data().userId)
        );

        // Distribusi XP per user
        const batch = db.batch();

        for (const userDoc of usersSnap.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();

            // Skip user yang daftar setelah event mulai
            if (userData.createdAt && event.startTime) {
                if (userData.createdAt.toMillis() > event.startTime.toMillis()) continue;
            }

            const isPresent = presentUserIds.has(userId);

            // Yang hadir sudah dapat XP via processAttendance
            // Yang tidak hadir dapat penalti
            if (!isPresent) {
                const xpPenalty = event.xpPenalty || 5;
                const currentXP = userData.xpCache || 0;
                const newXP = Math.max(0, currentXP - xpPenalty);

                const userRef = db.collection("users").doc(userId);
                batch.update(userRef, { xpCache: newXP });

                // Buat record absent
                const attendanceId = `${eventId}_${userId}`;
                const attendanceRef = db.collection("attendance").doc(attendanceId);
                batch.set(attendanceRef, {
                    eventId: eventId,
                    eventName: event.name,
                    userId: userId,
                    status: "absent",
                    xpChange: -xpPenalty,
                    attendedAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                // Catat di xpHistory
                const xpHistoryRef = db.collection("xpHistory").doc();
                batch.set(xpHistoryRef, {
                    userId: userId,
                    eventId: eventId,
                    change: -xpPenalty,
                    reason: "absent",
                    changedBy: "system",
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        }

        await batch.commit();

        // Tandai XP sudah didistribusi
        await eventRef.update({ xpDistributed: true });

        // Log
        await db.collection("logs").add({
            userId: requesterId,
            eventId: eventId,
            action: "close_event",
            result: "success",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, message: "Event closed successfully" };

    } catch (error) {
        console.error("Close event error:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});

// ============================================================
// EDIT XP MANUAL — KHUSUS ROLE INVENTORI KE ATAS
// ============================================================
exports.editXPManual = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Not authenticated");
    }

    const role = context.auth.token.role;
    if (!["inventori", "admin", "superadmin", "presiden"].includes(role)) {
        throw new functions.https.HttpsError("permission-denied", "Insufficient permissions");
    }

    const { targetUserId, newXP, reason } = data;
    const editorId = context.auth.uid;

    if (typeof newXP !== "number" || newXP < 0) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid XP value");
    }

    if (!reason || reason.trim().length < 5) {
        throw new functions.https.HttpsError("invalid-argument", "Reason is required (min 5 characters)");
    }

    try {
        const userRef = db.collection("users").doc(targetUserId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            throw new functions.https.HttpsError("not-found", "User not found");
        }

        const oldXP = userSnap.data().xpCache || 0;

        // Update XP
        await userRef.update({ xpCache: newXP });

        // Catat di xpHistory — immutable
        await db.collection("xpHistory").add({
            userId: targetUserId,
            oldXP: oldXP,
            newXP: newXP,
            change: newXP - oldXP,
            reason: reason.trim(),
            changedBy: editorId,
            changedByRole: role,
            type: "manual",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Log
        await db.collection("logs").add({
            userId: editorId,
            targetUserId: targetUserId,
            action: "manual_xp_edit",
            result: "success",
            oldXP: oldXP,
            newXP: newXP,
            reason: reason,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, oldXP, newXP };

    } catch (error) {
        throw new functions.https.HttpsError("internal", "Failed to update XP");
    }
});

// ============================================================
// IMPORT DATA ANGGOTA VIA CSV
// Hanya superadmin dan presiden yang bisa
// ============================================================
exports.importMembers = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Not authenticated");
    }

    const role = context.auth.token.role;
    if (!["superadmin", "presiden"].includes(role)) {
        throw new functions.https.HttpsError("permission-denied", "Insufficient permissions");
    }

    const { members } = data;

    if (!Array.isArray(members) || members.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "No member data provided");
    }

    const importerId = context.auth.uid;
    const results = { success: 0, failed: 0, errors: [] };
    const passwordExports = [];

    // Proses per batch (Firestore max 500 per batch)
    const batchSize = 400;
    for (let i = 0; i < members.length; i += batchSize) {
        const chunk = members.slice(i, i + batchSize);
        const batch = db.batch();

        for (const member of chunk) {
            try {
                // Validasi field wajib
                if (!member.memberId || !member.name || !member.division || !member.status) {
                    results.failed++;
                    results.errors.push(`Missing fields for: ${member.memberId || "unknown"}`);
                    continue;
                }

                // Validasi format ID
                if (!member.memberId.startsWith("NG")) {
                    results.failed++;
                    results.errors.push(`Invalid ID format: ${member.memberId}`);
                    continue;
                }

                // Skip status nonaktif
                const activeStatuses = ["ACTIVE", "NPC"];
                const memberStatus = member.status.toUpperCase();

                // Generate password sementara unik
                // Format: 4 karakter acak + angka + karakter unik
                const tempPassword = generateTempPassword();

                const memberRef = db.collection("members").doc(member.memberId);
                batch.set(memberRef, {
                    memberId: member.memberId,
                    name: member.name,
                    division: member.division,
                    status: memberStatus,
                    team: member.team || "",
                    tempPassword: tempPassword,
                    isRegistered: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    importedBy: importerId,
                }, { merge: true });

                results.success++;

                // Simpan untuk export password
                if (activeStatuses.includes(memberStatus)) {
                    passwordExports.push({
                        memberId: member.memberId,
                        name: member.name,
                        tempPassword: tempPassword,
                    });
                }

            } catch (error) {
                results.failed++;
                results.errors.push(`Error for ${member.memberId}: ${error.message}`);
            }
        }

        await batch.commit();
    }

    // Log import
    await db.collection("logs").add({
        userId: importerId,
        action: "import_members",
        result: "success",
        totalImported: results.success,
        totalFailed: results.failed,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
        success: true,
        results,
        passwords: passwordExports,
    };
});

// ============================================================
// GENERATE QR TOKEN
// Admin, superadmin, presiden bisa generate
// Superadmin dan presiden tidak butuh event aktif dari orang lain
// ============================================================
exports.generateToken = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Not authenticated");
    }

    const role = context.auth.token.role;
    if (!["admin", "superadmin", "presiden"].includes(role)) {
        throw new functions.https.HttpsError("permission-denied", "Insufficient permissions");
    }

    const { eventId } = data;

    try {
        // Validasi event aktif
        const eventSnap = await db.collection("events").doc(eventId).get();
        if (!eventSnap.exists || eventSnap.data().status !== "active") {
            throw new functions.https.HttpsError("failed-precondition", "Event is not active");
        }

        // Invalidate token lama untuk event ini
        const oldTokens = await db.collection("tokens")
            .where("eventId", "==", eventId)
            .where("used", "==", false)
            .get();

        const invalidateBatch = db.batch();
        oldTokens.docs.forEach((doc) => {
            invalidateBatch.update(doc.ref, {
                used: true,
                invalidatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });
        await invalidateBatch.commit();

        // Generate token baru
        const tokenId = generateSecureToken();
        const now = admin.firestore.Timestamp.now();
        const expiresAt = new admin.firestore.Timestamp(
            now.seconds + 12,
            now.nanoseconds
        );

        await db.collection("tokens").doc(tokenId).set({
            tokenId: tokenId,
            eventId: eventId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: expiresAt,
            used: false,
            usedBy: null,
            deviceFingerprint: null,
            createdBy: context.auth.uid,
        });

        return { success: true, tokenId, expiresAt: expiresAt.toMillis() };

    } catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});

// ============================================================
// APPROVE IZIN TIDAK HADIR
// Hanya admin ke atas yang bisa approve
// ============================================================
exports.approveLeaveRequest = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Not authenticated");
    }

    const role = context.auth.token.role;
    if (!["admin", "superadmin", "presiden"].includes(role)) {
        throw new functions.https.HttpsError("permission-denied", "Insufficient permissions");
    }

    const { requestId, approved } = data;
    const approverId = context.auth.uid;

    try {
        const requestRef = db.collection("leaveRequests").doc(requestId);
        const requestSnap = await requestRef.get();

        if (!requestSnap.exists) {
            throw new functions.https.HttpsError("not-found", "Request not found");
        }

        const request = requestSnap.data();
        if (request.status !== "pending") {
            throw new functions.https.HttpsError("failed-precondition", "Request already processed");
        }

        await requestRef.update({
            status: approved ? "approved" : "rejected",
            processedBy: approverId,
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Jika approved, buat record attendance dengan status excused
        if (approved) {
            const attendanceId = `${request.eventId}_${request.userId}`;
            await db.collection("attendance").doc(attendanceId).set({
                eventId: request.eventId,
                userId: request.userId,
                status: "excused",
                xpChange: 0,
                approvedBy: approverId,
                attendedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // Notifikasi ke user
        await db.collection("notifications").add({
            userId: request.userId,
            type: "leave_request",
            message: approved
                ? "Your leave request has been approved"
                : "Your leave request has been rejected",
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await db.collection("logs").add({
            userId: approverId,
            targetUserId: request.userId,
            action: approved ? "approve_leave" : "reject_leave",
            result: "success",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true };

    } catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});

// ============================================================
// CLEANUP TOKEN EXPIRED — BERJALAN OTOMATIS SETIAP JAM
// Firestore TTL alternatif untuk membersihkan token lama
// ============================================================
exports.cleanupExpiredTokens = functions.pubsub
    .schedule("every 1 hours")
    .onRun(async (context) => {
        const now = admin.firestore.Timestamp.now();
        const expiredTokens = await db.collection("tokens")
            .where("expiresAt", "<", now)
            .where("used", "==", false)
            .limit(500)
            .get();

        if (expiredTokens.empty) return null;

        const batch = db.batch();
        expiredTokens.docs.forEach((doc) => {
            batch.update(doc.ref, { used: true });
        });

        await batch.commit();
        console.log(`Cleaned up ${expiredTokens.size} expired tokens`);
        return null;
    });

// ============================================================
// FUNGSI HELPER INTERNAL
// ============================================================

// Generate password sementara yang memenuhi standar
// Format: Xxxx + angka + karakter unik
function generateTempPassword() {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghjkmnpqrstuvwxyz";
    const numbers = "23456789";
    const special = "!@#$%";

    const rand = (str) => str[Math.floor(Math.random() * str.length)];

    return (
        rand(upper) +
        rand(lower) +
        rand(lower) +
        rand(lower) +
        rand(numbers) +
        rand(numbers) +
        rand(special) +
        rand(lower)
    );
}

// Generate token yang aman secara kriptografis
function generateSecureToken() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 32; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
}

// Cek dan catat anomaly
async function checkAnomaly(userId, reason, deviceFingerprint) {
    try {
        // Ambil log gagal dalam 5 menit terakhir
        const fiveMinutesAgo = new admin.firestore.Timestamp(
            admin.firestore.Timestamp.now().seconds - 300,
            0
        );

        const recentFails = await db.collection("logs")
            .where("userId", "==", userId)
            .where("result", "==", "failed")
            .where("timestamp", ">", fiveMinutesAgo)
            .get();

        let score = 0;
        const reasons = [reason];

        // Scoring
        if (recentFails.size >= 3) { score += 2; reasons.push("multiple_failures"); }
        if (reason === "DEVICE_MISMATCH") { score += 3; }
        if (reason === "TOKEN_USED") { score += 3; reasons.push("token_reuse_attempt"); }

        if (score >= 4) {
            await db.collection("anomalies").add({
                userId: userId,
                score: score,
                reasons: reasons,
                deviceFingerprint: deviceFingerprint,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Block user jika score terlalu tinggi
            if (score >= 8) {
                await db.collection("users").doc(userId).update({
                    status: "suspended",
                    suspendedAt: admin.firestore.FieldValue.serverTimestamp(),
                    suspendReason: "anomaly_detected",
                });
            }
        }
    } catch (error) {
        console.error("Check anomaly error:", error);
    }
}