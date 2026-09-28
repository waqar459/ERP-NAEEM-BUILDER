import React, { useState } from 'react';
import { X, FolderGit2, Building2, Plus, Trash2 } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { BOQItem } from '../../types/erp';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectId: string) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const { branches, createProject } = useERP();

  const [title, setTitle] = useState('');
  const [client, setClient] = useState('Meezan Bank Limited');
  const [branchId, setBranchId] = useState(branches[0]?.id || 'BR-LHR-001');
  const [projectManager, setProjectManager] = useState('Engr. Salman Tariq (PMP)');
  const [awardNumber, setAwardNumber] = useState(`MBL/HO/WKS/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetEndDate, setTargetEndDate] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Initial BOQ Items
  const [boqItems, setBoqItems] = useState<Array<{
    itemCode: string;
    category: BOQItem['category'];
    description: string;
    unit: BOQItem['unit'];
    contractQuantity: number;
    rate: number;
  }>>([
    {
      itemCode: 'CIV-01',
      category: 'Civil Works',
      description: 'Porcelain floor tiles 600x600mm RAK double-glazed laying with mortar & grouting',
      unit: 'Sq.Ft',
      contractQuantity: 3200,
      rate: 450,
    },
    {
      itemCode: 'ELE-01',
      category: 'Electrical & Lighting',
      description: 'Internal electrical rewiring, Pakistan Cables 7/0.29 in PVC conduits with Clipsal switches',
      unit: 'Job',
      contractQuantity: 1,
      rate: 750000,
    },
    {
      itemCode: 'HVAC-01',
      category: 'HVAC Ducting & AC',
      description: 'Supply & installation of 4-Ton Daikin Inverter Floor Standing units with copper piping',
      unit: 'Nos',
      contractQuantity: 4,
      rate: 340000,
    },
    {
      itemCode: 'GLS-01',
      category: 'Carpentry & Woodwork',
      description: '12mm clear tempered glass manager cabin partitions with brushed SS patch fittings',
      unit: 'Sq.Ft',
      contractQuantity: 850,
      rate: 780,
    },
  ]);

  if (!isOpen) return null;

  const handleAddBoqRow = () => {
    setBoqItems([
      ...boqItems,
      {
        itemCode: `ITM-0${boqItems.length + 1}`,
        category: 'Civil Works',
        description: 'New BOQ Item',
        unit: 'Nos',
        contractQuantity: 10,
        rate: 5000,
      },
    ]);
  };

  const handleRemoveBoqRow = (idx: number) => {
    setBoqItems(boqItems.filter((_, i) => i !== idx));
  };

  const totalContract = boqItems.reduce((sum, item) => sum + item.contractQuantity * item.rate, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selBranch = branches.find((b) => b.id === branchId) || branches[0];

    const boqData: BOQItem[] = boqItems.map((item, index) => {
      const contractAmount = item.contractQuantity * item.rate;
      return {
        id: `boq-${Date.now()}-${index}`,
        itemCode: item.itemCode,
        category: item.category,
        description: item.description,
        unit: item.unit,
        contractQuantity: item.contractQuantity,
        rate: item.rate,
        contractAmount,
        revisedQuantity: item.contractQuantity,
        completedQuantity: 0,
        remainingQuantity: item.contractQuantity,
      };
    });

    const newProj = createProject({
      projectCode: `PRJ-${selBranch.city.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      title: title || `${selBranch.name} Complete Branch Fitout`,
      client,
      branchId: selBranch.id,
      branchName: selBranch.name,
      city: selBranch.city,
      region: selBranch.region,
      awardNumber,
      contractValue: totalContract,
      startDate,
      expectedCompletionDate: targetEndDate,
      projectManager,
      overallProgressPercent: 0,
      status: 'Procurement',
      directMaterialCost: Math.round(totalContract * 0.42),
      directLabourCost: Math.round(totalContract * 0.12),
      directSubcontractCost: Math.round(totalContract * 0.05),
      directFuelKmCost: Math.round(totalContract * 0.01),
      directSiteExpenses: Math.round(totalContract * 0.02),
      totalActualProjectCost: Math.round(totalContract * 0.62),
      totalBilledAmount: 0,
      totalReceivedAmount: 0,
      totalOutstanding: 0,
      totalRetentionHeld: 0,
      grossProfitMarginPercent: 38,
      boq: boqData,
      raBills: [],
    });

    onProjectCreated(newProj.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Branch Build-Up Project</h2>
              <p className="text-xs text-slate-400">System 2 (Branch + Region) Master Record with initial BOQ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Client Organization:</label>
              <input
                type="text"
                required
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Branch Location:</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city} - {b.region})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Project Manager:</label>
              <input
                type="text"
                required
                value={projectManager}
                onChange={(e) => setProjectManager(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-slate-400 block mb-1 font-medium">Project Title / Scope:</label>
              <input
                type="text"
                required
                placeholder="e.g. Complete 3,200 SFT Civil, MEP & Interior Build-up"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Award Letter / PO Ref:</label>
              <input
                type="text"
                required
                value={awardNumber}
                onChange={(e) => setAwardNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Start Date:</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Target Handover Date:</label>
              <input
                type="date"
                required
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Initial BOQ Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                  Initial Bill of Quantities (BOQ Items)
                </span>
                <span className="text-[11px] text-slate-500">
                  Item, description, unit, contract quantity and rate.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddBoqRow}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add BOQ Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {boqItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 grid grid-cols-12 gap-2 items-center text-xs"
                >
                  <input
                    type="text"
                    value={item.itemCode}
                    onChange={(e) => {
                      const copy = [...boqItems];
                      copy[idx].itemCode = e.target.value;
                      setBoqItems(copy);
                    }}
                    placeholder="Code"
                    className="col-span-2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => {
                      const copy = [...boqItems];
                      copy[idx].description = e.target.value;
                      setBoqItems(copy);
                    }}
                    placeholder="Description"
                    className="col-span-4 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                  />
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => {
                      const copy = [...boqItems];
                      copy[idx].unit = e.target.value as BOQItem['unit'];
                      setBoqItems(copy);
                    }}
                    placeholder="Unit"
                    className="col-span-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-center"
                  />
                  <input
                    type="number"
                    value={item.contractQuantity}
                    onChange={(e) => {
                      const copy = [...boqItems];
                      copy[idx].contractQuantity = Number(e.target.value);
                      setBoqItems(copy);
                    }}
                    placeholder="Qty"
                    className="col-span-2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-right font-mono"
                  />
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => {
                      const copy = [...boqItems];
                      copy[idx].rate = Number(e.target.value);
                      setBoqItems(copy);
                    }}
                    placeholder="Rate"
                    className="col-span-2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-right font-mono"
                  />
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveBoqRow(idx)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Total Contract Value (Computed):</span>
              <span className="text-emerald-400 font-bold text-sm">
                PKR {totalContract.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Create Project Master Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
