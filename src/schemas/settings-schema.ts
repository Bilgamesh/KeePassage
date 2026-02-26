import { z } from 'zod';

const Settings = z.object({
  recent: z.array(z.string()),
  alwaysOnTop: z.boolean(),
  showPreview: z.boolean(),
  showMenuBar: z.boolean(),
  showToolbar: z.boolean(),
  showTrayIcon: z.boolean(),
  hideUserNames: z.boolean(),
  minimiseInsteadOfExit: z.boolean(),
  clipboardTimout: z.number().nullable(),
  dbTimeout: z.number().nullable(),
  dbMinimiseLock: z.boolean(),
  language: z.string()
});
type Settings = z.infer<typeof Settings>;

export { Settings };
