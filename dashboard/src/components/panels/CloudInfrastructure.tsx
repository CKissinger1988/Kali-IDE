import { useEffect, useState } from 'react';
import { apiFetch } from '../../api';

interface VM {
  vmid: number;
  name: string;
  ip: string;
  status: string;
  node: string;
}

interface Node {
  node: string;
  status: string;
}

export default function CloudInfrastructure() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [vms, setVms] = useState<VM[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const nodeRes = await apiFetch('/api/proxmox/nodes');
      if (nodeRes.ok) {
        setNodes(nodeRes.nodes);
        const allVms: VM[] = [];
        for (const node of nodeRes.nodes) {
          const vmRes = await apiFetch(`/api/proxmox/vms/${node.node || node.name}`);
          if (vmRes.ok) {
            allVms.push(...vmRes.vms.map((vm: any) => ({ ...vm, node: node.node || node.name })));
          }
        }
        setVms(allVms);
      }
    } catch (err) {
      console.error("Failed to load infrastructure data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (vmid: number, node: string, action: string) => {
    if (!true) return;
    try {
      await apiFetch('/api/proxmox/vm/action', {
        method: 'POST',
        body: JSON.stringify({ node, vmid, action })
      });
      loadData();
    } catch (err) {
      
    }
  };

  const handlePcap = async (vmid: number, node: string) => {
    const duration = "";
    if (!duration) return;
    try {
      await apiFetch('/api/proxmox/vm/pcap', {
        method: 'POST',
        body: JSON.stringify({ node, vmid, duration: parseInt(duration) })
      });
      
    } catch (err) {
      
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Cloud Infrastructure</h2>
        <button 
          onClick={loadData}
          className="bg-[#2a2a2a] px-3 py-1 rounded border border-[#3b3b3b] text-[12px] hover:bg-[#333]"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#181818] p-4 rounded-lg border border-[#2b2b2b]">
          <div className="text-[11px] text-[#8e8e8e] uppercase tracking-wider">Active Nodes</div>
          <div className="text-2xl font-mono text-cyan-400">{nodes.length}</div>
        </div>
        <div className="bg-[#181818] p-4 rounded-lg border border-[#2b2b2b]">
          <div className="text-[11px] text-[#8e8e8e] uppercase tracking-wider">Deployed Shards</div>
          <div className="text-2xl font-mono text-green-400">{vms.length}</div>
        </div>
      </div>

      <div className="bg-[#181818] rounded-lg border border-[#2b2b2b] overflow-hidden">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="bg-[#252525] text-[#8e8e8e]">
              <th className="p-3">VMID</th>
              <th>Name</th>
              <th>IP Address</th>
              <th>Status</th>
              <th>Node</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2b2b2b]">
            {vms.map(vm => (
              <tr key={`${vm.node}-${vm.vmid}`} className="hover:bg-[#1f1f1f]">
                <td className="p-3 font-mono">{vm.vmid}</td>
                <td>{vm.name}</td>
                <td className="font-mono">{vm.ip || '—'}</td>
                <td>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${vm.status === 'running' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                    {vm.status.toUpperCase()}
                  </span>
                </td>
                <td className="text-[#8e8e8e]">{vm.node}</td>
                <td className="p-3 text-right flex gap-2 justify-end">
                  <button onClick={() => handlePcap(vm.vmid, vm.node)} className="text-green-500 hover:underline">PCAP</button>
                  <button onClick={() => handleAction(vm.vmid, vm.node, 'stop')} className="text-red-500 hover:underline">STOP</button>
                </td>
              </tr>
            ))}
            {vms.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-[#8e8e8e]">No virtual shards detected in cluster.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
