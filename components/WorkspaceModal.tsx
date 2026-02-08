import React, { useState } from 'react';
import { Workspace } from '../types';
import { Plus, Trash2, Link as LinkIcon, CheckSquare, Save } from 'lucide-react';

interface WorkspaceModalProps {
  workspace: Workspace;
  onSave: (ws: Workspace) => void;
  onClose: () => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({ workspace, onSave, onClose }) => {
  const [editedWs, setEditedWs] = useState<Workspace>(JSON.parse(JSON.stringify(workspace)));
  const [newLink, setNewLink] = useState({ label: '', url: '' });
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const addLink = () => {
    if (newLink.label && newLink.url) {
      setEditedWs({
        ...editedWs,
        links: [...editedWs.links, { id: Date.now().toString(), ...newLink }]
      });
      setNewLink({ label: '', url: '' });
    }
  };

  const removeLink = (id: string) => {
    setEditedWs({
        ...editedWs,
        links: editedWs.links.filter(l => l.id !== id)
    });
  };

  const addChecklist = () => {
      if(newChecklistItem) {
          setEditedWs({
              ...editedWs,
              startupChecklist: [...editedWs.startupChecklist, newChecklistItem]
          });
          setNewChecklistItem('');
      }
  };

   const removeChecklist = (idx: number) => {
      setEditedWs({
          ...editedWs,
          startupChecklist: editedWs.startupChecklist.filter((_, i) => i !== idx)
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Edit Workspace: {editedWs.title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Links Section */}
            <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center"><LinkIcon className="w-4 h-4 mr-2"/> Environment Links</h4>
                <div className="space-y-2 mb-3">
                    {editedWs.links.map(link => (
                        <div key={link.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                            <div className="truncate">
                                <span className="font-medium text-indigo-700">{link.label}</span>
                                <span className="text-gray-400 mx-2">|</span>
                                <span className="text-gray-500 truncate">{link.url}</span>
                            </div>
                            <button onClick={() => removeLink(link.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input 
                        className="flex-1 p-2 border rounded text-sm outline-none" 
                        placeholder="Label (e.g. GitHub)" 
                        value={newLink.label} onChange={e => setNewLink({...newLink, label: e.target.value})}
                    />
                    <input 
                        className="flex-1 p-2 border rounded text-sm outline-none" 
                        placeholder="URL (https://...)" 
                        value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})}
                    />
                    <button onClick={addLink} className="p-2 bg-gray-100 rounded hover:bg-gray-200"><Plus className="w-4 h-4 text-gray-600"/></button>
                </div>
            </div>

            <hr />

            {/* Checklist Section */}
             <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center"><CheckSquare className="w-4 h-4 mr-2"/> Startup Checklist</h4>
                <div className="space-y-2 mb-3">
                     {editedWs.startupChecklist.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                            <span className="text-gray-700">{item}</span>
                            <button onClick={() => removeChecklist(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
                 <div className="flex gap-2">
                    <input 
                        className="flex-1 p-2 border rounded text-sm outline-none" 
                        placeholder="New item (e.g. Turn off phone notifications)" 
                        value={newChecklistItem} onChange={e => setNewChecklistItem(e.target.value)}
                    />
                    <button onClick={addChecklist} className="p-2 bg-gray-100 rounded hover:bg-gray-200"><Plus className="w-4 h-4 text-gray-600"/></button>
                </div>
             </div>

        </div>

        <div className="p-4 border-t flex justify-end space-x-2 bg-gray-50">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-white rounded">Cancel</button>
            <button onClick={() => onSave(editedWs)} className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium flex items-center">
                <Save className="w-4 h-4 mr-2" /> Save Workspace
            </button>
        </div>
      </div>
    </div>
  );
};
