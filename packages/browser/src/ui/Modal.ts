import closeIcon from '../svg/close';

interface Props {
  description: string;
  cancelText?: string;
  onCancel?: () => void;
  confirmText?: string;
  onConfirm?: () => void;
  hideWhenConfirm?: boolean;
  children?: HTMLElement;
}

export default class Modal {
  public element: HTMLDivElement;

  constructor(props: Props) {
    const { description, onCancel, cancelText, onConfirm, confirmText, hideWhenConfirm, children } = props;

    const rootDiv = document.createElement('div');
    rootDiv.className = 'qubic-modal__backdrop';
    rootDiv.style.display = 'none';
    rootDiv.onclick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
      onCancel?.();
    };

    const paperDiv = document.createElement('div');
    paperDiv.className = 'qubic-modal__paper';
    rootDiv.appendChild(paperDiv);

    const headerDiv = document.createElement('div');
    headerDiv.className = 'qubic-modal__header';
    paperDiv.appendChild(headerDiv);

    const closeSpan = document.createElement('span');
    closeSpan.className = 'qubic-modal__header-button';
    closeSpan.innerHTML = closeIcon;
    closeSpan.onclick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
      onCancel?.();
    };
    headerDiv.appendChild(closeSpan);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'qubic-modal__content';
    paperDiv.appendChild(contentDiv);

    const text = document.createElement('p');
    text.innerHTML = description;
    text.className = 'qubic-modal__message';

    contentDiv.appendChild(text);

    if (children) {
      contentDiv.appendChild(children);
    }

    const footerDiv = document.createElement('div');
    footerDiv.className = 'qubic-modal__footer';
    paperDiv.appendChild(footerDiv);

    if (cancelText && onCancel) {
      const cancelButton = this.createButton({
        innerHtml: cancelText,
        className: 'qubic-modal__button--cancel',
        onclick: (event: MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          this.hide();
          onCancel();
        },
      });

      footerDiv.appendChild(cancelButton);
    }

    if (confirmText && onConfirm) {
      const okButton = this.createButton({
        innerHtml: confirmText,
        className: 'qubic-modal__button--primary',
        onclick: (event: MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          if (hideWhenConfirm) {
            this.hide();
          }
          onConfirm();
        },
      });

      footerDiv.appendChild(okButton);
    }

    this.element = rootDiv;
  }

  public hide = (): void => {
    this.element.style.display = 'none';
  };

  public show = (): void => {
    setTimeout(() => {
      this.element.style.display = 'flex';
    }, 500);
  };

  private createButton = ({
    innerHtml,
    className,
    onclick,
  }: {
    innerHtml: string;
    className: string;
    onclick: GlobalEventHandlers['onclick'];
  }) => {
    const button = document.createElement('button');
    button.innerHTML = innerHtml;
    button.className = `${'qubic-modal__button '}${className}`;
    button.onclick = onclick;
    return button;
  };
}
