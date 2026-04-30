import { openPatientPage } from "../../utils/routes";

export default function PatientLink({ patientId, label }) {
  return (
    <button type="button" className="link-button" onClick={() => openPatientPage(patientId)}>
      {label}
    </button>
  );
}
