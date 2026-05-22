import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal } from './Modal';

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'テストモーダル',
  };

  it('isOpen が false の場合、何もレンダリングしないこと', () => {
    const { container } = render(
      <Modal {...defaultProps} isOpen={false}>
        <div>モーダルのコンテンツ</div>
      </Modal>
    );
    expect(container.firstChild).toBeNull();
  });

  it('isOpen が true の場合、タイトルとコンテンツをレンダリングすること', () => {
    render(
      <Modal {...defaultProps}>
        <div>モーダルのコンテンツ</div>
      </Modal>
    );

    // タイトルが表示されているか確認
    expect(screen.getByText('テストモーダル')).toBeInTheDocument();
    
    // コンテンツが表示されているか確認
    expect(screen.getByText('モーダルのコンテンツ')).toBeInTheDocument();
  });

  it('閉じるボタンをクリックしたときに onClose が呼び出されること', () => {
    const onCloseMock = vi.fn();
    render(
      <Modal {...defaultProps} onClose={onCloseMock}>
        <div>モーダルのコンテンツ</div>
      </Modal>
    );

    // 閉じるボタンを取得 (sr-onlyのテキスト "Close" を含むボタン、またはaria-label/役割など)
    // Modal.tsx では:
    // <button onClick={onClose} ...>
    //   <span className="sr-only">Close</span>
    //   ...
    // </button>
    // なので、テキストが "Close" である要素の親ボタンか、getByRole('button') を使う
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
