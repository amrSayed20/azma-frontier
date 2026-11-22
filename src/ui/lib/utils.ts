/**
 * AZMA OS — `cn`, the one place class names are merged.
 *
 * Written by hand rather than taken from the registry: the shadcn CLI did not
 * emit it (the alias it was given resolved to a path it would not create), and
 * a component that imports a module which does not exist fails at build, not
 * in review. Three lines are cheaper than a second attempt at the generator.
 *
 * `twMerge` is what makes a variant overridable: `cn('az:p-4', 'az:p-6')`
 * resolves to `az:p-6` instead of shipping both and letting source order
 * decide. It is configured for THIS project's prefix — without that it cannot
 * tell `az:p-4` from `az:p-6` and silently keeps both.
 */
import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Tailwind is imported with `prefix(az)` in app/globals.css, because 83 real
 * utility names already sit dormant in this repository and an unprefixed
 * build would animate all of them at once — including `min-h-full flex
 * flex-col` on <body>, which is every page in the platform.
 */
const twMerge = extendTailwindMerge({ prefix: 'az' });

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
