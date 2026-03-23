// --- GOOGLE SHEETS CONFIGURATION ---
// 1. Create a Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Paste the script provided in the guide
// 4. Deploy as Web App (Execute as: Me, Access: Anyone)
// 5. Paste the Web App URL below:
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwi6uCiOfXGuasIKPCG8h7WJzAJydo3JWNOBRut5fq4EnJnZoAfmt53YYa4HC9EmuyF/exec"; // e.g., "https://script.google.com/macros/s/.../exec"

export interface Intern {
  id: string;
  name: string;
  college: string;
  branch: string;
  doj: string;
  endDate: string;
  phone: string;
  email: string;
  address: string;
}

export interface AttendanceRecord {
  internId: string;
  internName?: string;
  name?: string;
  date: string;
  status: 'P' | 'A' | 'H';
}

const INTERNS_KEY = 'intern_track_interns';
const ATTENDANCE_KEY = 'intern_track_attendance';

// Initial mock attendance data
const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { internId: '1', internName: 'Alex Johnson', name: 'Alex Johnson', date: '2024-03-20', status: 'P' },
  { internId: '2', internName: 'Sarah Smith', name: 'Sarah Smith', date: '2024-03-20', status: 'A' },
  { internId: '3', internName: 'Michael Brown', name: 'Michael Brown', date: '2024-03-20', status: 'P' },
  { internId: '4', internName: 'Emily Davis', name: 'Emily Davis', date: '2024-03-20', status: 'H' },
  { internId: '5', internName: 'David Wilson', name: 'David Wilson', date: '2024-03-20', status: 'P' },
];

// Initial mock data
const INITIAL_INTERNS: Intern[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    college: 'Tech University',
    branch: 'Computer Science',
    doj: '2024-01-15',
    endDate: '2024-07-15',
    phone: '555-0101',
    email: 'alex@example.com',
    address: '123 Tech Lane, Silicon Valley'
  },
  {
    id: '2',
    name: 'Sarah Smith',
    college: 'State College',
    branch: 'Information Technology',
    doj: '2024-02-01',
    endDate: '2024-08-01',
    phone: '555-0102',
    email: 'sarah@example.com',
    address: '456 College Ave, Boston'
  },
  {
    id: '3',
    name: 'Michael Brown',
    college: 'City Institute',
    branch: 'Electronics',
    doj: '2024-03-10',
    endDate: '2024-09-10',
    phone: '555-0103',
    email: 'michael@example.com',
    address: '789 Park Road, Chicago'
  },
  {
    id: '4',
    name: 'Emily Davis',
    college: 'Westside University',
    branch: 'Mechanical',
    doj: '2024-01-20',
    endDate: '2024-07-20',
    phone: '555-0104',
    email: 'emily@example.com',
    address: '321 Lake View, Seattle'
  },
  {
    id: '5',
    name: 'David Wilson',
    college: 'East Coast College',
    branch: 'Civil',
    doj: '2024-02-15',
    endDate: '2024-08-15',
    phone: '555-0105',
    email: 'david@example.com',
    address: '654 Mountain Trail, Denver'
  }
];

export const storageService = {
  getInterns: async (): Promise<Intern[]> => {
    if (GOOGLE_SCRIPT_URL) {
      try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getInterns`);
        const data = await response.json();
        
        // Ensure data is an array, even if the script returns a single object
        const dataArray = Array.isArray(data) ? data : (data ? [data] : []);
        
        // Filter out empty rows or invalid data from Google Sheets, but be less strict
        const filteredData = dataArray
          .filter((i: any) => i && (i.name || i.Name)) // Handle different casing
          .map((i: any, index: number) => ({ 
            id: i.id || i.ID || `sheet-${index}`,
            name: i.name || i.Name || 'Unknown Intern',
            college: i.college || i.College || 'N/A',
            branch: i.branch || i.Branch || 'N/A',
            doj: i.doj || i.DOJ || 'N/A',
            endDate: i.endDate || i.EndDate || 'N/A',
            phone: i.phone || i.Phone || 'N/A',
            email: i.email || i.Email || 'N/A',
            address: i.address || i.Address || 'N/A'
          }));
        
        // If we got data from sheets, return it. Otherwise, continue to local storage fallback.
        if (filteredData.length > 0) {
          return filteredData;
        }
      } catch (e) {
        console.error("Failed to fetch from Google Sheets, falling back to local storage", e);
      }
    }

    const data = localStorage.getItem(INTERNS_KEY);
    if (!data) {
      localStorage.setItem(INTERNS_KEY, JSON.stringify(INITIAL_INTERNS));
      return INITIAL_INTERNS;
    }
    return JSON.parse(data);
  },

  addIntern: async (intern: Omit<Intern, 'id'>): Promise<void> => {
    if (GOOGLE_SCRIPT_URL) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // Apps Script requires no-cors for simple POSTs
          body: JSON.stringify({ action: 'addIntern', ...intern })
        });
      } catch (e) {
        console.error("Failed to post to Google Sheets", e);
      }
    }

    const interns = await storageService.getInterns();
    const newIntern = { ...intern, id: Date.now().toString() };
    localStorage.setItem(INTERNS_KEY, JSON.stringify([...interns, newIntern]));
  },

  getAttendance: async (): Promise<AttendanceRecord[]> => {
    if (GOOGLE_SCRIPT_URL) {
      try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAttendance`);
        return await response.json();
      } catch (e) {
        console.error("Failed to fetch attendance from Google Sheets", e);
      }
    }

    const data = localStorage.getItem(ATTENDANCE_KEY);
    if (!data) {
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(INITIAL_ATTENDANCE));
      return INITIAL_ATTENDANCE;
    }
    return JSON.parse(data);
  },

  saveAttendance: async (records: AttendanceRecord[]): Promise<void> => {
    if (GOOGLE_SCRIPT_URL) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({ action: 'saveAttendance', records })
        });
      } catch (e) {
        console.error("Failed to post attendance to Google Sheets", e);
      }
    }

    const existing = await storageService.getAttendance();
    const updated = [...existing];
    records.forEach(newRec => {
      const idx = updated.findIndex(r => r.internId === newRec.internId && r.date === newRec.date);
      if (idx > -1) {
        updated[idx] = newRec;
      } else {
        updated.push(newRec);
      }
    });
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updated));
  },

  deleteIntern: async (id: string): Promise<void> => {
    if (GOOGLE_SCRIPT_URL) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({ action: 'deleteIntern', id })
        });
      } catch (e) {
        console.error("Failed to delete from Google Sheets", e);
      }
    }

    const interns = await storageService.getInterns();
    const filtered = interns.filter(i => i.id !== id);
    localStorage.setItem(INTERNS_KEY, JSON.stringify(filtered));
  }
};
