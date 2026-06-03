import { FirebaseService } from '../../firebase/firebase.service';
export declare class ExportService {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
    exportAttendanceCSV(eventId?: string): Promise<string>;
    exportMembersCSV(): Promise<string>;
    exportUsersCSV(): Promise<string>;
}
