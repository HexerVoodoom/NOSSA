import defaultLibraryData from '../data/defaultLibrary.json';

// Seed data exported from the client's own ObraViva instance (members, roles,
// competencies, evaluations). Installed as the default library on first run.
export const defaultLibrary = defaultLibraryData as {
  version: string;
  timestamp: string;
  members: any[];
  roles: any[];
  competencies: any[];
  evaluations: any[];
};
