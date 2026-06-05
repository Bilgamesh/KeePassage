import { appearance } from 'gui';
import {
  type Accessor,
  createContext,
  createSignal,
  type ParentComponent,
  type Setter,
  useContext
} from 'solid-js';
import { APP_NAME, DEFAULT_SETTINGS } from '#/data/constants';
import type { DbIndex, Entry } from '#/schemas/database-schema';

type Filter = { run: (entry: Entry) => boolean };
type Nullable<T> = T | null;
type PasswordPolicy = {
  lowerCase: boolean;
  upperCase: boolean;
  numbers: boolean;
  symbols: boolean;
  length: number;
};

type AppState = {
  appSettings: Accessor<typeof DEFAULT_SETTINGS>;
  setAppSettings: Setter<typeof DEFAULT_SETTINGS>;
  selectedDbPath: Accessor<string>;
  setSelectedDbPath: Setter<string>;
  unlockedDbIndex: Accessor<Nullable<DbIndex>>;
  setUnlockedDbIndex: Setter<Nullable<DbIndex>>;
  selectedEntry: Accessor<Nullable<Entry>>;
  setSelectedEntry: Setter<Nullable<Entry>>;
  filter: Accessor<Filter>;
  setFilter: Setter<Filter>;
  copyingEnabled: Accessor<boolean>;
  setCopyingEnabled: Setter<boolean>;
  isDark: Accessor<boolean>;
  setDark: Setter<boolean>;
  serial: Accessor<number | null>;
  setSerial: Setter<number | null>;
  purpose: Accessor<string>;
  setPurpose: Setter<string>;
  passwordVisible: Accessor<boolean>;
  setPasswordVisible: Setter<boolean>;
  title: Accessor<string>;
  setTitle: Setter<string>;
  username: Accessor<string>;
  setUsername: Setter<string>;
  password: Accessor<string>;
  setPassword: Setter<string>;
  url: Accessor<string>;
  setUrl: Setter<string>;
  tags: Accessor<string>;
  setTags: Setter<string>;
  notes: Accessor<string>;
  setNotes: Setter<string>;
  modified: Accessor<number>;
  setModified: Setter<number>;
  pwGenerator: {
    password: Accessor<string>;
    setPassword: Setter<string>;
    passwordPolicy: Accessor<PasswordPolicy>;
    setPasswordPolicy: Setter<PasswordPolicy>;
    requestInProgress: Accessor<boolean>;
    setRequestInProgress: Setter<boolean>;
  };
};

const AppContext = createContext<AppState>();

const AppProvider: ParentComponent = (props) => {
  const [appSettings, setAppSettings] = createSignal(DEFAULT_SETTINGS);
  const [selectedDbPath, setSelectedDbPath] = createSignal('');
  const [unlockedDbIndex, setUnlockedDbIndex] =
    createSignal<Nullable<DbIndex>>(null);
  const [selectedEntry, setSelectedEntry] = createSignal<Nullable<Entry>>(null);
  const [filter, setFilter] = createSignal<Filter>({ run: () => true });
  const [copyingEnabled, setCopyingEnabled] = createSignal(true);
  const [isDark, setDark] = createSignal(appearance.isDarkScheme());
  const [serial, setSerial] = createSignal<number | null>(null);
  const [purpose, setPurpose] = createSignal(`${APP_NAME} Database`);
  const [passwordVisible, setPasswordVisible] = createSignal(false);
  const [title, setTitle] = createSignal('');
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [url, setUrl] = createSignal('');
  const [tags, setTags] = createSignal('');
  const [notes, setNotes] = createSignal('');
  const [modified, setModified] = createSignal(Date.now());

  const DEFAULT_PASSWORD_POLICY = {
    lowerCase: true,
    upperCase: true,
    numbers: true,
    symbols: true,
    length: 32
  };

  const [pwGeneratorPassword, setPwGeneratorPassword] = createSignal('');
  const [passwordPolicy, setPasswordPolicy] = createSignal(
    DEFAULT_PASSWORD_POLICY
  );
  const [requestInProgress, setRequestInProgress] = createSignal(false);

  const store: AppState = {
    appSettings,
    setAppSettings,
    selectedDbPath,
    setSelectedDbPath,
    unlockedDbIndex,
    setUnlockedDbIndex,
    selectedEntry,
    setSelectedEntry,
    filter,
    setFilter,
    copyingEnabled,
    setCopyingEnabled,
    isDark,
    setDark,
    serial,
    setSerial,
    purpose,
    setPurpose,
    passwordVisible,
    setPasswordVisible,
    title,
    setTitle,
    username,
    setUsername,
    password,
    setPassword,
    url,
    setUrl,
    tags,
    setTags,
    notes,
    setNotes,
    modified,
    setModified,
    pwGenerator: {
      password: pwGeneratorPassword,
      setPassword: setPwGeneratorPassword,
      passwordPolicy,
      setPasswordPolicy,
      requestInProgress,
      setRequestInProgress
    }
  };

  return (
    <AppContext.Provider value={store}>{props.children}</AppContext.Provider>
  );
};

function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    console.log('here');
    console.trace();
    throw new Error('useAppContext must be used inside AppProvider');
  }

  return context;
}

export { AppProvider, type AppState, useAppContext };
