import { useEffect, useState } from "react";

function formatPatientSearchLabel(patient) {
  if (!patient) {
    return "";
  }

  return `${patient.fullName} - Card ${patient.cardNumber || "-"}`;
}

export default function SearchablePatientSelect({ value, patientOptions, onChange, required = false }) {
  const [patientSearch, setPatientSearch] = useState("");
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);

  const selectedPatient = patientOptions.find((patient) => patient.id === value);
  const filteredPatients = patientOptions.filter((patient) => {
    const query = patientSearch.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      patient.fullName.toLowerCase().includes(query) ||
      String(patient.cardNumber || "").includes(query) ||
      (patient.phone || "").toLowerCase().includes(query)
    );
  });

  function handlePatientPick(patientId) {
    const patient = patientOptions.find((item) => item.id === patientId);

    onChange(patientId);
    setPatientSearch(formatPatientSearchLabel(patient));
    setPatientDropdownOpen(false);
  }

  useEffect(() => {
    setPatientSearch(formatPatientSearchLabel(selectedPatient));
  }, [selectedPatient]);

  return (
    <div className="search-select">
      <input
        value={patientSearch}
        placeholder="Search patient by name, card no., or phone"
        onChange={(event) => {
          const nextValue = event.target.value;
          const selectedLabel = formatPatientSearchLabel(selectedPatient);

          setPatientSearch(nextValue);
          setPatientDropdownOpen(true);

          if (!nextValue.trim() || nextValue !== selectedLabel) {
            onChange("");
          }
        }}
        onFocus={() => setPatientDropdownOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setPatientDropdownOpen(false), 120);
        }}
        required={required}
      />
      <input type="hidden" value={value} readOnly required={required} />
      {patientDropdownOpen ? (
        <div className="search-select-menu">
          {filteredPatients.length === 0 ? (
            <div className="search-select-empty">No matching patients found.</div>
          ) : (
            filteredPatients.map((patient) => (
              <button
                key={patient.id}
                type="button"
                className="search-select-option"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handlePatientPick(patient.id);
                }}
              >
                <span className="search-select-option__name">{patient.fullName}</span>
                <span className="search-select-option__meta">Card No. {patient.cardNumber || "-"} • {patient.phone || "-"}</span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
