/** Alerta inline de feedback (sucesso, erro, aviso). */
export default function FeedbackAlert({ message, variant = 'success' }) {
  if (!message) return null;
  return <div className={`alert alert-${variant} py-2 mb-4`}>{message}</div>;
}
