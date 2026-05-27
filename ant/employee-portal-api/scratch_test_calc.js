// Offline verification script for dashboard leave calculations
const mockLeaveData = [
  {
    "EmpId": "00000001",
    "EmpName": "Kaar",
    "LeaveId": "        1",
    "LeaveType": "0300",
    "LeaveDesc": "Sick leave",
    "FromDate": "/Date(1741651200000)/",
    "ToDate": "/Date(1741910400000)/",
    "TotalDays": 4,
    "LeaveStatus": "APPROVED",
    "Reason": "Sick leave"
  },
  {
    "EmpId": "00000001",
    "EmpName": "Kaar",
    "LeaveId": "        2",
    "LeaveType": "0720",
    "LeaveDesc": "Fravær/skoft",
    "FromDate": "/Date(1744588800000)/",
    "ToDate": "/Date(1744675200000)/",
    "TotalDays": 2,
    "LeaveStatus": "APPROVED",
    "Reason": "Fravær/skoft"
  },
  {
    "EmpId": "00000001",
    "EmpName": "Kaar",
    "LeaveId": "        3",
    "LeaveType": "LWP",
    "LeaveDesc": "Sick leave",
    "FromDate": "/Date(1778112000000)/",
    "ToDate": "/Date(1778198400000)/",
    "TotalDays": 0,
    "LeaveStatus": "APPROVED",
    "Reason": "Sick leave"
  },
  {
    "EmpId": "00000001",
    "EmpName": "Kaar",
    "LeaveId": "        4",
    "LeaveType": "",
    "LeaveDesc": "Sick leave",
    "FromDate": "/Date(1778198400000)/",
    "ToDate": "/Date(1778284800000)/",
    "TotalDays": 0,
    "LeaveStatus": "APPROVED",
    "Reason": "Sick leave"
  },
  {
    "EmpId": "00000001",
    "EmpName": "Kaar",
    "LeaveId": "        5",
    "LeaveType": "",
    "LeaveDesc": "Sick leave",
    "FromDate": "/Date(1778284800000)/",
    "ToDate": "/Date(1778284800000)/",
    "TotalDays": 0,
    "LeaveStatus": "APPROVED",
    "Reason": "Sick leave"
  },
  {
    "EmpId": "00000001",
    "EmpName": "Kaar",
    "LeaveId": "        6",
    "LeaveType": "0200",
    "LeaveDesc": "Sick leave",
    "FromDate": "/Date(1778803200000)/",
    "ToDate": "/Date(1778976000000)/",
    "TotalDays": 0,
    "LeaveStatus": "APPROVED",
    "Reason": "Sick leave"
  }
];

function calculateLeaves(leaveData) {
  let usedAnnual = 0;
  let usedSick = 0;
  let usedCasual = 0;

  leaveData.forEach(l => {
    const type = (l.LeaveType || l.Type || '').toLowerCase();
    const desc = (l.LeaveDesc || l.Reason || '').toLowerCase();
    let days = parseInt(l.TotalDays, 10) || 0;
    
    if (!days && l.FromDate && l.ToDate) {
      try {
        const fromMs = parseInt(l.FromDate.match(/\/Date\((\d+)\)\//)?.[1], 10);
        const toMs = parseInt(l.ToDate.match(/\/Date\((\d+)\)\//)?.[1], 10);
        if (!isNaN(fromMs) && !isNaN(toMs)) {
          const diffMs = toMs - fromMs;
          const calcDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
          days = calcDays > 365 ? 0 : calcDays;
        }
      } catch (e) {}
    }

    if (type.includes('lwp')) {
      // Leave Without Pay - don't count towards any balance
    } else if (type.includes('0300') || type.includes('annual') || type.includes('pl') || type.includes('al') || desc.includes('annual')) {
      usedAnnual += days;
    } else if (type.includes('0200') || type.includes('sick') || type.includes('sl') || desc.includes('sick')) {
      usedSick += days;
    } else if (type.includes('0100') || type.includes('casual') || type.includes('cl') || desc.includes('casual')) {
      usedCasual += days;
    }
  });

  const annualAvail = 21 - usedAnnual;
  const sickAvail = 10 - usedSick;
  const casualAvail = 7 - usedCasual;

  return {
    usedAnnual,
    usedSick,
    usedCasual,
    annualAvail,
    sickAvail,
    casualAvail,
    totalAvail: annualAvail + sickAvail + casualAvail
  };
}

const result = calculateLeaves(mockLeaveData);
console.log("Calculated Results:");
console.log(JSON.stringify(result, null, 2));

// Test assertions
if (result.usedAnnual === 4 && result.usedSick === 6 && result.usedCasual === 0) {
  console.log("✅ Leave calculations are 100% correct!");
} else {
  console.error("❌ Leave calculations do not match expected values.");
}
