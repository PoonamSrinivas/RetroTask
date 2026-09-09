import { Injectable } from '@nestjs/common';

export interface Member {
  id: string;
  name: string;
  hasSpoken: boolean;
  color: string;
}

@Injectable()
export class AppService {
  private members: Member[] = [
    { id: '1', name: 'Alice', hasSpoken: false, color: '#FF5733' },
    { id: '2', name: 'Bob', hasSpoken: false, color: '#33FF57' },
    { id: '3', name: 'Charlie', hasSpoken: false, color: '#3357FF' },
    { id: '4', name: 'Diana', hasSpoken: false, color: '#F333FF' },
    { id: '5', name: 'Eve', hasSpoken: false, color: '#33FFF5' },
    { id: '6', name: 'Frank', hasSpoken: false, color: '#F5FF33' },
  ];

  getMembers(): Member[] {
    return this.members;
  }

  spin(): { winner: Member, isReset: boolean } {
    const randomIndex = Math.floor(Math.random() * this.members.length);
    const selectedMember = this.members[randomIndex];
    
    // We no longer mark anyone as spoken, allowing repeated picks.
    return { winner: selectedMember, isReset: false };
  }

  reset(): void {
    this.members.forEach((m) => (m.hasSpoken = false));
  }
}
