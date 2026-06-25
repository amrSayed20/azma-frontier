/**
 * UI contracts for runtime dashboard consumption.
 */

import { ExecutiveStatusSnapshot, RuntimeSnapshot } from '../types/al-wateen.types';

export interface DashboardModel {
  readonly snapshot: RuntimeSnapshot;
  readonly executive: ExecutiveStatusSnapshot;
}

export interface DashboardProvider {
  getDashboardModel(): DashboardModel;
}
