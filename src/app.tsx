import { Router } from '@/components/router';
import { Toolbar } from '@/components/toolbar';
import { mainPageIndex } from '@/data/shared-state';
import { DatabaseIndexPage } from '@/pages/database-index-page';
import { EntryPage } from '@/pages/entry-page';
import { PinentryPage } from '@/pages/pinentry-page';
import { PwGeneratorPage } from '@/pages/pw-generator-page';
import { SettingsPage } from '@/pages/settings-page';
import { TouchPage } from '@/pages/touch-page';
import { WelcomePage } from '@/pages/welcome-page';
import { type Window } from 'gui';

function App(props: { window: Window }) {
  return (
    <>
      <Toolbar window={props.window} />
      <Router selectedPageIndex={mainPageIndex}>
        <WelcomePage window={props.window} />
        <PinentryPage />
        <TouchPage />
        <DatabaseIndexPage window={props.window} />
        <EntryPage />
        <SettingsPage window={props.window} />
        <PwGeneratorPage />
      </Router>
    </>
  );
}

export { App };
