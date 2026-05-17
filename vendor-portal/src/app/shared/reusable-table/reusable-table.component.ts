import {
  Component, Input, OnChanges, SimpleChanges,
  ViewChild, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as XLSX from 'xlsx';
import { SapDatePipe } from '../pipes/sap-date.pipe';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'status' | 'date' | 'amount' | 'action';
  actionLabel?: string;
  actionIcon?: string;
}

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatInputModule, MatFormFieldModule, MatIconModule, MatButtonModule, MatTooltipModule, SapDatePipe
  ],
  templateUrl: './reusable-table.component.html',
  styleUrl: './reusable-table.component.scss'
})
export class ReusableTableComponent implements OnChanges, AfterViewInit {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() title = '';
  @Input() exportFileName = 'export';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<any>([]);
  searchQuery = '';

  get displayedColumns(): string[] {
    return this.columns.map(c => c.key);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataSource.data = this.data ?? [];
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applySearch(): void {
    this.dataSource.filter = this.searchQuery.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  exportExcel(): void {
    const ws = XLSX.utils.json_to_sheet(this.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${this.exportFileName}.xlsx`);
  }

  getStatusClass(value: string): string {
    const v = (value || '').toLowerCase();
    if (['completed', 'approved', 'paid', 'posted', 'confirmed', 'released'].includes(v)) return 'chip chip-success';
    if (['pending', 'open', 'in process', 'partially'].includes(v)) return 'chip chip-warning';
    if (['rejected', 'cancelled', 'overdue', 'blocked'].includes(v)) return 'chip chip-error';
    if (['new', 'draft', 'created'].includes(v)) return 'chip chip-info';
    return 'chip chip-neutral';
  }

  trackByFn(_: number, item: any): any {
    return item;
  }
}
