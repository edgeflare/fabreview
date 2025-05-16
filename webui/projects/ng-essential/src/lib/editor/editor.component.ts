import {CommonModule} from '@angular/common';
import {
  Component,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
  Input,
  AfterViewInit,
  SimpleChanges,
  OnChanges,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import * as ace from 'ace-builds';
import {fromEvent, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';

/**
 * An Angular component that provides a code editor using the Ace library.
 */
@Component({
  selector: 'ng-editor',
  standalone: true,
  imports: [CommonModule],
  template: `<div #editorContainer [ngStyle]="{'height': height, 'width': width}"></div>`,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  /**
   * Reference to the container element where the Ace editor will be rendered.
   */
  @ViewChild('editorContainer') private editorContainer!: ElementRef<HTMLElement>;

  /**
   * Event emitted when the editor content changes (debounced).
   */
  @Output() editorContentChanged = new EventEmitter<string>();

  /**
   * Event emitted after the Ace editor is successfully initialized.
   */
  @Output() editorInitialized = new EventEmitter<ace.Ace.Editor>();

  /**
   * Event emitted if an error occurs during Ace editor initialization.
   */
  @Output() editorErrored = new EventEmitter<Error>();

  /**
   * The initial content of the editor.
   */
  @Input() content = '';

  /**
   * Whether the editor is read-only (default: false).
   */
  @Input() isReadOnly = false;

  /**
   * The height of the editor (default: '60vh').
   */
  @Input() height = '60vh';

  /**
   * The width of the editor (default: '100%').
   */
  @Input() width = '100%';

  /**
   * The theme to use for the editor (default: 'xcode').
   */
  @Input() theme = 'xcode';

  /**
   * The syntax highlighting mode, ie language, to use (default: 'yaml').
   */
  @Input() mode = 'yaml';

  /**
   * The font size to use in the editor (default: '1rem').
   */
  @Input() fontSize = '1rem';

  /**
   * Whether to enable basic autocompletion (default: true).
   */
  @Input() enableBasicAutocompletion = true;

  /**
   * Whether to enable snippets (default: true).
   */
  @Input() enableSnippets = true;

  /**
   * Whether to enable live autocompletion (default: true).
   */
  @Input() enableLiveAutocompletion = true;

  /**
   * Whether to show the gutter (line numbers) (default: false).
   */
  @Input() showGutter = false;

  /**
   * Additional Ace editor options.
   */
  @Input() aceOptions: Partial<ace.Ace.EditorOptions> = {};

  /**
   * The debounce time in milliseconds for content change events (default: 300).
   */
  @Input() debounceTimeMs = 300;

  private aceEditor!: ace.Ace.Editor;
  private destroy$ = new Subject<void>();

  ngAfterViewInit(): void {
    this.initializeAceEditor();
  }

  private initializeAceEditor(): void {
    try {
      ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.41.0/src-noconflict');
      this.aceEditor = ace.edit(this.editorContainer.nativeElement);
      this.applyEditorSettings();

      // Debounce content change events and unsubscribe on destroy
      fromEvent(this.aceEditor, 'change')
        .pipe(debounceTime(this.debounceTimeMs), takeUntil(this.destroy$))
        .subscribe(() => {
          this.editorContentChanged.emit(this.aceEditor.getValue());
        });

      this.editorInitialized.emit(this.aceEditor);
    } catch (error) {
      console.error('Error initializing Ace editor:', error);
      this.editorErrored.emit(error as Error);
    }
  }

  private applyEditorSettings(): void {
    this.aceEditor.session.setValue(this.content);
    this.aceEditor.setTheme(`ace/theme/${this.theme}`);
    this.aceEditor.session.setMode(`ace/mode/${this.mode}`);
    this.aceEditor.setReadOnly(this.isReadOnly);

    // Apply additional options from aceOptions input
    this.aceEditor.setOptions({
      ...this.aceOptions,
      fontSize: this.fontSize,
      showGutter: this.showGutter,
      enableBasicAutocompletion: this.enableBasicAutocompletion,
      enableSnippets: this.enableSnippets,
      enableLiveAutocompletion: this.enableLiveAutocompletion,
    });

    this.aceEditor.container.style.height = this.height;
    this.aceEditor.container.style.width = this.width;
    this.aceEditor.resize(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.aceEditor) return;

    if (changes['content'] && !changes['content'].isFirstChange()) {
      // retrieve cursor position and scroll top
      const cursorPosition = this.aceEditor.getCursorPosition();
      const scrollTop = this.aceEditor.getSession().getScrollTop();
      // update content, cursor position, and scroll top
      this.aceEditor.session.setValue(this.content);
      this.aceEditor.moveCursorToPosition(cursorPosition);
      this.aceEditor.getSession().setScrollTop(scrollTop);
    }

    for (const propName in changes) {
      if (Object.prototype.hasOwnProperty.call(this, propName)) {
        switch (propName) {
          case 'theme':
            this.aceEditor.setTheme(`ace/theme/${changes[propName].currentValue}`);
            break;
          case 'mode':
            this.aceEditor.session.setMode(`ace/mode/${changes[propName].currentValue}`);
            break;
          case 'fontSize':
            this.aceEditor.setOptions({
              fontSize: changes[propName].currentValue,
            });
            break;
          case 'isReadOnly':
            this.aceEditor.setReadOnly(changes[propName].currentValue);
            break;
          case 'showGutter':
            this.aceEditor.setOptions({
              showGutter: changes[propName].currentValue,
            });
            break;
          case 'enableBasicAutocompletion':
          case 'enableSnippets':
          case 'enableLiveAutocompletion':
            this.aceEditor.setOptions({
              [propName]: changes[propName].currentValue,
            });
            break;
          // additional cases for other properties
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.aceEditor) {
      this.aceEditor.destroy();
      this.aceEditor.container.remove();
    }
  }
}
