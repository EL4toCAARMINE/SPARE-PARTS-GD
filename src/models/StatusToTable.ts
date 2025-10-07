export type StatusToTable = {
    id: number;
    text: string;
    cssClass: ('badge-ghost' | 'badge-neutral' | 'badge-primary' |	'badge-secondary' | 'badge-accent' | 'badge-info' | 'badge-success' | 'badge-warning' | 'badge-error');
    optionsForStatus: ('pdf' | 'excel' | 'info' | 'edit' | 'delete' | 'cancel' | 'all')[];
}