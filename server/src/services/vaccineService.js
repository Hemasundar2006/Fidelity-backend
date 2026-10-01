export const generateVaccineSchedule = (dob) => {
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };
  return [
    { vaccine: 'BCG', dueDate: addDays(dob, 0), status: 'due' },
    { vaccine: 'OPV-0', dueDate: addDays(dob, 0), status: 'due' },
    { vaccine: 'Hep B-1', dueDate: addDays(dob, 0), status: 'due' },
    { vaccine: 'OPV-1', dueDate: addDays(dob, 42), status: 'due' },
    { vaccine: 'Penta-1', dueDate: addDays(dob, 42), status: 'due' },
    { vaccine: 'Rota-1', dueDate: addDays(dob, 42), status: 'due' },
    { vaccine: 'fIPV-1', dueDate: addDays(dob, 42), status: 'due' },
    { vaccine: 'PCV-1', dueDate: addDays(dob, 42), status: 'due' },
    { vaccine: 'OPV-2', dueDate: addDays(dob, 70), status: 'due' },
    { vaccine: 'Penta-2', dueDate: addDays(dob, 70), status: 'due' },
    { vaccine: 'Rota-2', dueDate: addDays(dob, 70), status: 'due' },
    { vaccine: 'OPV-3', dueDate: addDays(dob, 98), status: 'due' },
    { vaccine: 'Penta-3', dueDate: addDays(dob, 98), status: 'due' },
    { vaccine: 'Rota-3', dueDate: addDays(dob, 98), status: 'due' },
    { vaccine: 'fIPV-2', dueDate: addDays(dob, 98), status: 'due' },
    { vaccine: 'PCV-2', dueDate: addDays(dob, 98), status: 'due' },
    { vaccine: 'MR-1', dueDate: addDays(dob, 270), status: 'due' },
    { vaccine: 'fIPV-3', dueDate: addDays(dob, 270), status: 'due' },
    { vaccine: 'PCV booster', dueDate: addDays(dob, 270), status: 'due' },
    { vaccine: 'Vitamin A', dueDate: addDays(dob, 270), status: 'due' },
    { vaccine: 'MR-2', dueDate: addDays(dob, 480), status: 'due' },
    { vaccine: 'DPT booster-1', dueDate: addDays(dob, 480), status: 'due' },
    { vaccine: 'OPV booster', dueDate: addDays(dob, 480), status: 'due' },
  ];
};
