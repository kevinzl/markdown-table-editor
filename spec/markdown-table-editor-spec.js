'use babel';

/* eslint-env jasmine */
/* global waitsForPromise */

import { Point } from 'atom';

function prepareEditor(name, scope, text) {
  return atom.workspace.open(name)
    .then(editor => {
      const grammar = atom.grammars.grammarForScopeName(scope);
      expect(grammar).not.toBe(undefined);
      editor.setGrammar(grammar);
      editor.setText(text);
      return editor;
    });
}

describe('markdown-table-editor', () => {
  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('language-gfm'));
    waitsForPromise(() => atom.packages.activatePackage('markdown-table-editor'));
  });

  describe('activation', () => {
    it('should activate table editor if the grammar is contained in the config', () => {
      atom.config.set('markdown-table-editor.grammars', ['source.gfm', 'text.md']);
      const text
        = '\n'
        + '| A | B | C | D |\n'
        + ' | ---- |:---- | ----:|:----:| \n'
        + '  | E | F | G | H |  \n';
      waitsForPromise(() =>
        prepareEditor('test.md', 'source.gfm', text).then(editor => {
          const elem = editor.getElement();
          editor.setCursorBufferPosition(new Point(0, 0));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(false);
          editor.setCursorBufferPosition(new Point(1, 0));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(true);
          editor.setCursorBufferPosition(new Point(2, 1));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(true);
          editor.setCursorBufferPosition(new Point(3, 2));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(true);
          editor.setCursorBufferPosition(new Point(4, 0));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(false);
        })
      );
    });

    it('should not activate table editor if the grammar is not contained in the config', () => {
      atom.config.set('markdown-table-editor.grammars', ['text.md']);
      const text
        = '\n'
        + '| A | B | C | D |\n'
        + ' | ---- |:---- | ----:|:----:| \n'
        + '  | E | F | G | H |  \n';
      waitsForPromise(() =>
        prepareEditor('test.md', 'source.gfm', text).then(editor => {
          const elem = editor.getElement();
          editor.setCursorBufferPosition(new Point(0, 0));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(false);
          editor.setCursorBufferPosition(new Point(1, 0));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(false);
          editor.setCursorBufferPosition(new Point(2, 5));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(false);
          editor.setCursorBufferPosition(new Point(3, 10));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(false);
          editor.setCursorBufferPosition(new Point(4, 0));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(false);
        })
      );
    });
  });

  describe('commands', () => {
    beforeEach(() => {
      atom.config.set('markdown-table-editor.grammars', ['source.gfm', 'text.md']);
      atom.config.set('markdown-table-editor.minimumContentWidth', 3);
      atom.config.set('markdown-table-editor.eawAmbiguousAsWide', false);
      atom.config.set('markdown-table-editor.alwaysWideChars', '');
      atom.config.set('markdown-table-editor.alwaysNarrowChars', '');
      atom.config.set('markdown-table-editor.smartCursor', false);
    });

    describe('format', () => {
      it('should format a table', () => {
        const text
          = '| A | B | C | D |\n'
          + ' | ---- |:---- | ----:|:----:| \n'
          + '  | E | F | G | H |  \n';
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:format');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(0);
            expect(pos.column).toBe(3);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(1, 7));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:format');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(1);
            expect(pos.column).toBe(5);
          })
        );
      });
    });

    describe('escape', () => {
      it('should format a table and escape', () => {
        {
          const text
            = '| A | B | C | D |\n'
            + ' | ---- |:---- | ----:|:----:| \n'
            + '  | E | F | G | H |  \n';
          waitsForPromise(() =>
            prepareEditor('test.md', 'source.gfm', text).then(editor => {
              editor.setCursorBufferPosition(new Point(0, 2));
              atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:escape');
              const formatted
                = '|  A  |  B  |  C  |  D  |\n'
                + '| --- |:--- | ---:|:---:|\n'
                + '| E   | F   |   G |  H  |\n';
              expect(editor.getText()).toBe(formatted);
              const pos = editor.getCursorBufferPosition();
              expect(pos.row).toBe(3);
              expect(pos.column).toBe(0);
            })
          );
        }
        {
          const text
            = '| A | B | C | D |\n'
            + ' | ---- |:---- | ----:|:----:| \n'
            + '  | E | F | G | H |  ';
          waitsForPromise(() =>
            prepareEditor('test.md', 'source.gfm', text).then(editor => {
              editor.setCursorBufferPosition(new Point(0, 2));
              atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:escape');
              const formatted
                = '|  A  |  B  |  C  |  D  |\n'
                + '| --- |:--- | ---:|:---:|\n'
                + '| E   | F   |   G |  H  |\n';
              expect(editor.getText()).toBe(formatted);
              const pos = editor.getCursorBufferPosition();
              expect(pos.row).toBe(3);
              expect(pos.column).toBe(0);
            })
          );
        }
      });
    });

    describe('align-left', () => {
      it('should change alignment of a column to left', () => {
        const text
          = '| A | B | C | D |\n'
          + ' | ---- |:---- | ----:|:----:| \n'
          + '  | E | F | G | H |  \n';
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(2, 4));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:align-left');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '|:--- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(2);
            expect(pos.column).toBe(2);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(1, 7));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:align-left');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '|:--- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(1);
            expect(pos.column).toBe(5);
          })
        );
      });
    });

    describe('align-right', () => {
      it('should change alignment of a column to right', () => {
        const text
          = '| A | B | C | D |\n'
          + ' | ---- |:---- | ----:|:----:| \n'
          + '  | E | F | G | H |  \n';
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(2, 4));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:align-right');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| ---:|:--- | ---:|:---:|\n'
              + '|   E | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(2);
            expect(pos.column).toBe(4);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(1, 7));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:align-right');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| ---:|:--- | ---:|:---:|\n'
              + '|   E | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(1);
            expect(pos.column).toBe(6);
          })
        );
      });
    });

    describe('align-center', () => {
      it('should change alignment of a column to center', () => {
        const text
          = '| A | B | C | D |\n'
          + ' | ---- |:---- | ----:|:----:| \n'
          + '  | E | F | G | H |  \n';
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(2, 4));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:align-center');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '|:---:|:--- | ---:|:---:|\n'
              + '|  E  | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(2);
            expect(pos.column).toBe(3);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(1, 7));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:align-center');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '|:---:|:--- | ---:|:---:|\n'
              + '|  E  | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(1);
            expect(pos.column).toBe(5);
          })
        );
      });
    });

    describe('align-default', () => {
      it('should change alignment of a column to default', () => {
        const text
          = '| A | B | C | D |\n'
          + ' | ---- |:---- | ----:|:----:| \n'
          + '  | E | F | G | H |  \n';
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(2, 16));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:align-default');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:| --- |\n'
              + '| E   | F   |   G | H   |\n';
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(2);
            expect(pos.column).toBe(20);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(1, 29));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:align-default');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:| --- |\n'
              + '| E   | F   |   G | H   |\n';
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(1);
            expect(pos.column).toBe(23);
          })
        );
      });
    });

    describe('select-cell', () => {
      it('should select content of a cell', () => {
        const text
          = '| A | B | C | D |\n'
          + ' | ---- |:---- | ----:|:----:| \n'
          + '  | E | F | G | H |  \n';
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:select-cell');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(0);
            expect(sel.start.column).toBe(3);
            expect(sel.end.row).toBe(0);
            expect(sel.end.column).toBe(4);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(1, 7));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:select-cell');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(1);
            expect(sel.start.column).toBe(2);
            expect(sel.end.row).toBe(1);
            expect(sel.end.column).toBe(5);
          })
        );
      });
    });

    describe('move-left', () => {
      it('should move focus to the left cell', () => {
        const text
          = '| A | B | C | D |\n'
          + ' | ---- |:---- | ----:|:----:| \n'
          + '  | E | F | G | H |  \n';
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(2, 8));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:move-left');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(2);
            expect(sel.start.column).toBe(2);
            expect(sel.end.row).toBe(2);
            expect(sel.end.column).toBe(3);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(2, 2));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:move-left');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(2);
            expect(sel.start.column).toBe(2);
            expect(sel.end.row).toBe(2);
            expect(sel.end.column).toBe(3);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(1, 9));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:move-left');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(1);
            expect(sel.start.column).toBe(2);
            expect(sel.end.row).toBe(1);
            expect(sel.end.column).toBe(5);
          })
        );
      });
    });

    describe('move-right', () => {
      it('should move focus to the right cell', () => {
        const text
          = '| A | B | C | D |\n'
          + ' | ---- |:---- | ----:|:----:| \n'
          + '  | E | F | G | H |  \n';
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(2, 12));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:move-right');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(2);
            expect(sel.start.column).toBe(21);
            expect(sel.end.row).toBe(2);
            expect(sel.end.column).toBe(22);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(2, 21));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:move-right');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(2);
            expect(sel.start.column).toBe(21);
            expect(sel.end.row).toBe(2);
            expect(sel.end.column).toBe(22);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(1, 17));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:move-right');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(1);
            expect(sel.start.column).toBe(19);
            expect(sel.end.row).toBe(1);
            expect(sel.end.column).toBe(24);
          })
        );
      });
    });

    describe('move-up', () => {
      it('should move focus to the up cell', () => {
        const text
          = '| A | B | C | D |\n'
          + ' | ---- |:---- | ----:|:----:| \n'
          + '  | E | F | G | H |  \n'
          + '   | I | J | K | L |   \n';
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(3, 5));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:move-up');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n'
              + '| I   | J   |   K |  L  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(2);
            expect(sel.start.column).toBe(2);
            expect(sel.end.row).toBe(2);
            expect(sel.end.column).toBe(3);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(2, 4));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:move-up');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n'
              + '| I   | J   |   K |  L  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(0);
            expect(sel.start.column).toBe(3);
            expect(sel.end.row).toBe(0);
            expect(sel.end.column).toBe(4);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:move-up');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n'
              + '| I   | J   |   K |  L  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(0);
            expect(sel.start.column).toBe(3);
            expect(sel.end.row).toBe(0);
            expect(sel.end.column).toBe(4);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(1, 3));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:move-up');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n'
              + '| I   | J   |   K |  L  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(0);
            expect(sel.start.column).toBe(3);
            expect(sel.end.row).toBe(0);
            expect(sel.end.column).toBe(4);
          })
        );
      });
    });

    describe('move-down', () => {
      it('should move focus to the down cell', () => {
        const text
          = '| A | B | C | D |\n'
          + ' | ---- |:---- | ----:|:----:| \n'
          + '  | E | F | G | H |  \n'
          + '   | I | J | K | L |   \n';
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(2, 4));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:move-down');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n'
              + '| I   | J   |   K |  L  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(3);
            expect(sel.start.column).toBe(2);
            expect(sel.end.row).toBe(3);
            expect(sel.end.column).toBe(3);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(3, 5));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:move-down');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n'
              + '| I   | J   |   K |  L  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(3);
            expect(sel.start.column).toBe(2);
            expect(sel.end.row).toBe(3);
            expect(sel.end.column).toBe(3);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:move-down');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n'
              + '| I   | J   |   K |  L  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(2);
            expect(sel.start.column).toBe(2);
            expect(sel.end.row).toBe(2);
            expect(sel.end.column).toBe(3);
          })
        );
        waitsForPromise(() =>
          prepareEditor('test.md', 'source.gfm', text).then(editor => {
            editor.setCursorBufferPosition(new Point(1, 3));
            atom.commands.dispatch(editor.getElement(), 'markdown-table-editor:move-down');
            const formatted
              = '|  A  |  B  |  C  |  D  |\n'
              + '| --- |:--- | ---:|:---:|\n'
              + '| E   | F   |   G |  H  |\n'
              + '| I   | J   |   K |  L  |\n';
            expect(editor.getText()).toBe(formatted);
            const sel = editor.getSelectedBufferRange();
            expect(sel.start.row).toBe(2);
            expect(sel.start.column).toBe(2);
            expect(sel.end.row).toBe(2);
            expect(sel.end.column).toBe(3);
          })
        );
      });
    });

    xdescribe('next-cell', () => {
      it('should move focus to the next cell');
    });

    xdescribe('previous-cell', () => {
      it('should move focus to the previous cell');
    });

    xdescribe('next-row', () => {
      it('should move focus to the next row');
    });

    xdescribe('insert-row', () => {
      it('should insert a new row');
    });

    xdescribe('delete-row', () => {
      it('should delete a row');
    });

    xdescribe('insert-column', () => {
      it('should insert a new column');
    });

    xdescribe('delete-column', () => {
      it('should delete a column');
    });
  });
});
