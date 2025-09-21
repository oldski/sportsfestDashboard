'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateTeamsPage(orgSlug: string) {
  revalidatePath(`/organizations/${orgSlug}/teams`, 'page');
}