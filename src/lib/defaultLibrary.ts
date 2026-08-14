import { Member, Role, Competency, SavedWork } from '../types';
import defaultLibraryData from '../data/defaultLibrary.json';

// Como o JSON não tem tipo Date, todos os campos de data chegam como string ISO.
// Serialized<T> descreve a entidade "como ela existe no arquivo/localStorage",
// evitando fingir que `createdAt` já é um Date (a UI faz `new Date(...)`).
type Serialized<T> = {
  [K in keyof T]: T[K] extends Date | undefined ? string | undefined : T[K] extends Date ? string : T[K];
};

// Seed data exported from the client's own ObraViva instance (members, roles,
// competencies, evaluations). Installed as the default library on first run.
export const defaultLibrary = defaultLibraryData as unknown as {
  version: string;
  timestamp: string;
  members: Serialized<Member>[];
  roles: Serialized<Role>[];
  competencies: Serialized<Competency>[];
  evaluations: Serialized<SavedWork>[];
};
