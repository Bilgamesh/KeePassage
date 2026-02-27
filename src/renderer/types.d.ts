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
  backgroundColor?: string;
  color?: string;
  cursor?: gui.CursorType;
  enabled?: boolean;
  focusable?: boolean;
  font?: gui.Font;
  mouseDownCanMoveWindow?: boolean;
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
  ref?: (element: { node: NodeType }) => void;
  style?: Style;
  tooltip?: string;
  visible?: boolean;
}

export interface label<NodeType> extends view<NodeType> {
  align?: gui.TextAlign;
  attributedText?: gui.AttributedText;
  text?: string;
  vAlign?: gui.TextAlign;
}

export interface container<NodeType> extends view<NodeType> {
  children?: gui.View[];
  onDraw?: (self: NodeType, painter: gui.Painter, dirty: gui.RectF) => void;
}

export interface button<NodeType> extends view<NodeType> {
  buttonStyle?: gui.ButtonStyle;
  controlSize?: gui.ControlSize;
  hasBorder?: boolean;
  image?: gui.Image;
  onClick?: (self: NodeType) => void;
  title?: string;
}

export interface datepicker<NodeType> extends view<NodeType> {
  date?: Date;
  onDateChange?: (self: NodeType) => void;
  range?: { minimum: Date; maximum: Date };
}

export interface combobox<NodeType> extends picker<NodeType> {
  onTextChange?: (self: NodeType) => void;
  text?: string;
}

export interface picker<NodeType> extends view<NodeType> {
  items?: string[];
  onSelectionChange?: (self: NodeType) => void;
  selectedItemIndex?: number;
}

export interface entry<NodeType> extends view<NodeType> {
  onActivate?: (self: NodeType) => void;
  onTextChange?: (self: NodeType) => void;
  text?: string;
}

export interface gifplayer<NodeType> extends view<NodeType> {
  animating?: boolean;
  image?: gui.Image;
  scale?: gui.ImageScale;
}

export interface group<NodeType> extends view<NodeType> {
  children?: [gui.Container];
  title?: string;
}

export interface progressbar<NodeType> extends view<NodeType> {
  indeterminate?: boolean;
  value?: number;
}

export interface scroll<NodeType> extends view<NodeType> {
  children?: [gui.View];
  contentSize?: gui.SizeF;
  onScroll?: (self: NodeType) => void;
  overlayScrollbar?: boolean;
  scrollbarPolicy?: { hpolicy: gui.ScrollPolicy; vpolicy: gui.ScrollPolicy };
  scrollElasticity?: {
    helasticity: gui.ScrollElasticity;
    velasticity: gui.ScrollElasticity;
  };
  scrollPosition?: { horizon: number; vertical: number };
}

export interface vseparator<NodeType> extends view<NodeType> {}

export interface hseparator<NodeType> extends view<NodeType> {}

export interface slider<NodeType> extends view<NodeType> {
  onSlidingComplete?: (self: NodeType) => void;
  onValueChange?: (self: NodeType) => void;
  range?: { min: number; max: number };
  step?: number;
  value?: number;
}

export interface tab<NodeType> extends view<NodeType> {
  children: gui.View[];
  onSelectedPageChange?: (self: NodeType) => void;
  selectedPage?: number;
  titles: string[];
}

export interface table<NodeType> extends view<NodeType> {
  columns?: string[];
  columnsVisible?: boolean;
  columnsWithOptions?: { label: string; options: gui.TableColumnOptions }[];
  hasBorder?: boolean;
  model?: gui.TableModel;
  multipleSelections?: boolean;
  onRowActivate?: (self: NodeType, row: number) => void;
  onSelectionChange?: (self: NodeType) => void;
  onToggleCheckbox?: (self: NodeType, column: number, row: number) => void;
  rowHeight?: number;
  selectedRow?: number;
  selectedRows?: number[];
}

export interface textedit<NodeType> extends view<NodeType> {
  onTextChange?: (self: NodeType) => void;
  overlayScrollbar?: boolean;
  scrollbarPolicy?: { hpolicy: gui.ScrollPolicy; vpolicy: gui.ScrollPolicy };
  scrollElasticity?: {
    helasticity: gui.ScrollElasticity;
    velasticity: gui.ScrollElasticity;
  };
  selectedRange?: { start: number; end: number };
  shouldInsertNewLine?: (self: NodeType) => boolean;
  text?: string;
}

export interface vibrant<NodeType> extends container<NodeType> {
  blendingMode?: gui.VibrantBlendingMode;
  material?: gui.VibrantMaterial;
}

export interface checkbox<NodeType> extends button<NodeType> {
  checked?: boolean;
}

export interface radio<NodeType> extends button<NodeType> {
  checked?: boolean;
}

export interface browser<NodeType> extends view<NodeType> {
  html?: { html: string; baseUrl?: string } | string;
  javaScript?: { code: string; callback?: () => void };
  magnifiable?: boolean;
  onChangeLoading?: (self: NodeType) => void;
  onClose?: (self: NodeType) => void;
  onCommitNavigation?: (self: NodeType, url: string) => void;
  onFailNavigation?: (self: NodeType, url: string, code: number) => void;
  onFinishNavigation?: (self: NodeType, url: string) => void;
  onStartNavigation?: (self: NodeType, url: string) => void;
  onUpdateCommand?: (self: NodeType) => void;
  onUpdateTitle?: (self: NodeType, title: string) => void;
  url?: string;
  userAgent?: string;
}

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      browser: browser<gui.Browser>;
      button: button<gui.Button>;
      checkbox: checkbox<gui.Button>;
      combobox: combobox<gui.ComboBox>;
      container: container<gui.Container>;
      datepicker: datepicker<gui.DatePicker>;
      entry: entry<gui.Entry>;
      gifplayer: gifplayer<gui.GifPlayer>;
      group: group<gui.Group>;
      hseparator: hseparator<gui.Separator>;
      label: label<gui.Label>;
      password: entry<gui.Entry>;
      picker: picker<gui.Picker>;
      progressbar: progressbar<gui.ProgressBar>;
      radio: radio<gui.Button>;
      scroll: scroll<gui.Scroll>;
      slider: slider<gui.Slider>;
      tab: tab<gui.Tab>;
      table: table<gui.Table>;
      textedit: textedit<gui.TextEdit>;
      vibrant: vibrant<gui.Vibrant>;
      vseparator: vseparator<gui.Separator>;
    }
  }
}
