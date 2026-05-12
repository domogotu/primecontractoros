// @ts-nocheck
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, MessageSquare, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RecordNotes({ recordType, recordId }) {
  const [newNote, setNewNote] = useState("");
  const [showInput, setShowInput] = useState(false);
  const { data: notes = [], refetch } = trpc.recordNotes.list.useQuery({ recordType, recordId });
  const createMutation = trpc.recordNotes.create.useMutation({ onSuccess: () => { refetch(); setNewNote(""); setShowInput(false); } });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2"><MessageSquare className="h-4 w-4" />Notes</h4>
        <Button variant="ghost" size="sm" onClick={() => setShowInput(!showInput)}><Plus className="h-4 w-4 mr-1" />Add Note</Button>
      </div>
      {showInput && (
        <div className="space-y-2">
          <textarea className="w-full border rounded px-3 py-2 text-sm" placeholder="Write a note..." rows={3} value={newNote} onChange={(e) => setNewNote(e.target.value)} />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setShowInput(false); setNewNote(""); }}>Cancel</Button>
            <Button size="sm" onClick={() => { if (newNote.trim()) createMutation.mutate({ recordType, recordId, content: newNote }); }} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      )}
      {(notes as any[]).length === 0 ? (
        <p className="text-sm text-gray-400 italic">No notes yet.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {(notes as any[]).map((note) => (
            <div key={note.id} className="bg-gray-50 rounded p-3 text-sm">
              <p className="text-gray-800">{note.content}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{note.authorName || "You"}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(note.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
