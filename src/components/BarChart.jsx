import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function BarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBar data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="success" fill="#22c55e" name="Success" />
        <Bar dataKey="failed" fill="#ef4444" name="Failed" />
      </RechartsBar>
    </ResponsiveContainer>
  );
}
