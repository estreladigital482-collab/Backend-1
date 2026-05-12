---
category: Frontend
source: src/lib/projects.ts
created: 2026-05-05T19:45:45.746168
size: 1117 bytes
hash: ac4eb7cf0cc3c7782683c6ad5c8a0960
headers:
---

# projects.ts

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/lib/projects.ts`
- **Tamanho**: 1117 bytes

## Conteúdo

import type { Project } from "@/lib/types";

const STORAGE_KEY_PREFIX = "aura-sphere-projects";

function getProjectsStorageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

export function loadProjects(userId: string): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(getProjectsStorageKey(userId));
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
}

export function saveProjects(userId: string, projects: Project[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getProjectsStorageKey(userId), JSON.stringify(projects));
}

export function createProject(userId: string, project: Project) {
  const projects = loadProjects(userId);
  projects.push(project);
  saveProjects(userId, projects);
}

export function updateProject(userId: string, project: Project) {
  const projects = loadProjects(userId);
  const index = projects.findIndex((item) => item.id === project.id);
  if (index !== -1) {
    projects[index] = project;
    saveProjects(userId, projects);
  }
}


## Tags
#categoria/frontend
