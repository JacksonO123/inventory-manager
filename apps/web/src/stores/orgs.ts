import { create } from 'zustand';
import { Org } from '../types/types';

type OrgsState = {
  orgs: Org[];
};

type OrgsActions = {
  setOrgs: (orgs: Org[] | ((orgs: Org[]) => Org[])) => void;
};

export const useOrgs = create<OrgsState & OrgsActions>((set) => ({
  orgs: [],
  setOrgs: (orgs) =>
    set((state) => ({
      orgs: typeof orgs === 'function' ? orgs(state.orgs) : orgs
    }))
}));

type OrgPositionsState = {
  positions: number[];
};

type OrgPositionsActions = {
  setPositions: (positions: number[] | ((positions: number[]) => number[])) => void;
};

export const useOrgPositions = create<OrgPositionsState & OrgPositionsActions>((set) => ({
  positions: [],
  setPositions: (positions) =>
    set((state) => ({
      positions: typeof positions === 'function' ? positions(state.positions) : positions
    }))
}));
