import React from 'react';

interface StatCardProps {
    label: string;
    value: string;
    tone?: 'positive' | 'negative' | 'neutral';
}

const TONE_CLASS: Record<string, string> = {
    positive: 'metric-positive',
    negative: 'metric-negative',
    neutral: '',
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, tone = 'neutral' }) => (
    <div className="card stat">
        <span className="stat-label">{label}</span>
        <span className={`stat-value ${TONE_CLASS[tone] ?? ''}`}>{value}</span>
    </div>
);