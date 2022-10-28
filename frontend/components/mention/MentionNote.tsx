
export default function MentionNote({note}: { note: string | null }) {
  if (note) {
    return <div className="mt-2 text-sm opacity-60">{note}</div>
  }
  return null
}