import type * as gui from 'gui';

export type Style = {
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: gui.FontWeight;
  fontFamily?: string;
  fontStyle?: gui.FontStyle;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  flexDirection?: 'column' | 'row';
  flexGrow?: number;
  flex?: number;
  margin?: number;
  'margin-left'?: number;
  'margin-right'?: number;
  'margin-top'?: number;
  'margin-bottom'?: number;
  height?: number;
  width?: number;
};

export type MenuItemOptions = {
  type?: gui.MenuItemType;
  role?: gui.MenuItemRole;
  checked?: boolean;
  submenu?: MenuItemOptions[];
  visible?: boolean;
  enabled?: boolean;
  label?: string;
  accelerator?: string;
  image?: gui.Image;
  onClick?: (self: gui.MenuItem) => void;
};

export type TableColumn = {
  label: string;
  options: gui.TableColumnOptions;
};

export interface view<NodeType> {
  ref?: (element: { node: NodeType }) => void;
  color?: string;
  backgroundColor?: string;
  enabled?: boolean;
  cursor?: gui.CursorType;
  focusable?: boolean;
  font?: gui.Font;
  mouseDownCanMoveWindow?: boolean;
  tooltip?: string;
  visible?: boolean;
  onCaptureLost?: (self: NodeType) => void;
  onDragLeave?: (self: NodeType) => void;
  onFocusIn?: (self: NodeType) => void;
  onFocusOut?: (self: NodeType) => void;
  onKeyDown?: (self: NodeType, event: gui.KeyEvent) => void;
  onKeyUp?: (self: NodeType, event: gui.KeyEvent) => void;
  onMouseDown?: (self: NodeType, event: gui.MouseEvent) => void;
  onMouseEnter?: (self: NodeType, event: gui.MouseEvent) => void;
  onMouseLeave?: (self: NodeType, event: gui.MouseEvent) => void;
  onMouseMove?: (self: NodeType, event: gui.MouseEvent) => void;
  onMouseUp?: (self: NodeType, event: gui.MouseEvent) => void;
  onSizeChanged?: (self: NodeType) => void;
  style?: Style;
}

export interface label<NodeType> extends view<NodeType> {
  text?: string;
  align?: gui.TextAlign;
  vAlign?: gui.TextAlign;
  attributedText?: gui.AttributedText;
}

export interface container<NodeType> extends view<NodeType> {
  children?: gui.View[];
  onDraw?: (self: NodeType, painter: gui.Painter, dirty: gui.RectF) => void;
}

export interface button<NodeType> extends view<NodeType> {
  title?: string;
  controlSize?: gui.ControlSize;
  hasBorder?: boolean;
  image?: gui.Image;
  buttonStyle?: gui.ButtonStyle;
  onClick?: (self: NodeType) => void;
}

export interface datepicker<NodeType> extends view<NodeType> {
  range?: { minimum: Date; maximum: Date };
  date?: Date;
  onDateChange?: (self: NodeType) => void;
}

export interface combobox<NodeType> extends picker<NodeType> {
  text?: string;
  onTextChange?: (self: NodeType) => void;
}

export interface picker<NodeType> extends view<NodeType> {
  items?: string[];
  selectedItemIndex?: number;
  onSelectionChange?: (self: NodeType) => void;
}

export interface entry<NodeType> extends view<NodeType> {
  text?: string;
  onTextChange?: (self: NodeType) => void;
  onActivate?: (self: NodeType) => void;
}

export interface gifplayer<NodeType> extends view<NodeType> {
  image?: gui.Image;
  animating?: boolean;
  scale?: gui.ImageScale;
}

export interface group<NodeType> extends view<NodeType> {
  title?: string;
  children?: [gui.Container];
}

export interface progressbar<NodeType> extends view<NodeType> {
  value?: number;
  indeterminate?: boolean;
}

export interface scroll<NodeType> extends view<NodeType> {
  contentSize?: gui.SizeF;
  children?: [gui.View];
  scrollPosition?: { horizon: number; vertical: number };
  overlayScrollbar?: boolean;
  scrollbarPolicy?: { hpolicy: gui.ScrollPolicy; vpolicy: gui.ScrollPolicy };
  scrollElasticity?: {
    helasticity: gui.ScrollElasticity;
    velasticity: gui.ScrollElasticity;
  };
  onScroll?: (self: NodeType) => void;
}

export interface vseparator<NodeType> extends view<NodeType> {}

export interface hseparator<NodeType> extends view<NodeType> {}

export interface slider<NodeType> extends view<NodeType> {
  value?: number;
  step?: number;
  range?: { min: number; max: number };
  onValueChange?: (self: NodeType) => void;
  onSlidingComplete?: (self: NodeType) => void;
}

export interface tab<NodeType> extends view<NodeType> {
  children: gui.View[];
  titles: string[];
  selectedPage?: number;
  onSelectedPageChange?: (self: NodeType) => void;
}

export interface table<NodeType> extends view<NodeType> {
  model?: gui.TableModel;
  columns?: string[];
  columnsWithOptions?: { label: string; options: gui.TableColumnOptions }[];
  columnsVisible?: boolean;
  rowHeight?: number;
  hasBorder?: boolean;
  multipleSelections?: boolean;
  selectedRow?: number;
  selectedRows?: number[];
  onSelectionChange?: (self: NodeType) => void;
  onRowActivate?: (self: NodeType, row: number) => void;
  onToggleCheckbox?: (self: NodeType, column: number, row: number) => void;
}

export interface textedit<NodeType> extends view<NodeType> {
  text?: string;
  selectedRange?: { start: number; end: number };
  overlayScrollbar?: boolean;
  scrollbarPolicy?: { hpolicy: gui.ScrollPolicy; vpolicy: gui.ScrollPolicy };
  scrollElasticity?: {
    helasticity: gui.ScrollElasticity;
    velasticity: gui.ScrollElasticity;
  };
  onTextChange?: (self: NodeType) => void;
  shouldInsertNewLine?: (self: NodeType) => boolean;
}

export interface vibrant<NodeType> extends container<NodeType> {
  material?: gui.VibrantMaterial;
  blendingMode?: gui.VibrantBlendingMode;
}

export interface checkbox<NodeType> extends button<NodeType> {
  checked?: boolean;
}

export interface radio<NodeType> extends button<NodeType> {
  checked?: boolean;
}

export interface browser<NodeType> extends view<NodeType> {
  url?: string;
  html?: { html: string; baseUrl?: string } | string;
  userAgent?: string;
  magnifiable?: boolean;
  javaScript?: { code: string; callback?: Function };
  onClose?: (self: NodeType) => void;
  onUpdateCommand?: (self: NodeType) => void;
  onChangeLoading?: (self: NodeType) => void;
  onUpdateTitle?: (self: NodeType, title: string) => void;
  onStartNavigation?: (self: NodeType, url: string) => void;
  onCommitNavigation?: (self: NodeType, url: string) => void;
  onFinishNavigation?: (self: NodeType, url: string) => void;
  onFailNavigation?: (self: NodeType, url: string, code: number) => void;
}

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      label: label<gui.Label>;
      container: container<gui.Container>;
      button: button<gui.Button>;
      datepicker: datepicker<gui.DatePicker>;
      picker: picker<gui.Picker>;
      combobox: combobox<gui.ComboBox>;
      entry: entry<gui.Entry>;
      password: entry<gui.Entry>;
      gifplayer: gifplayer<gui.GifPlayer>;
      group: group<gui.Group>;
      progressbar: progressbar<gui.ProgressBar>;
      scroll: scroll<gui.Scroll>;
      vseparator: vseparator<gui.Separator>;
      hseparator: hseparator<gui.Separator>;
      slider: slider<gui.Slider>;
      tab: tab<gui.Tab>;
      table: table<gui.Table>;
      textedit: textedit<gui.TextEdit>;
      vibrant: vibrant<gui.Vibrant>;
      checkbox: checkbox<gui.Button>;
      radio: radio<gui.Button>;
      browser: browser<gui.Browser>;
    }
  }
}
