import { css, CSSInterpolation } from '@emotion/css';

import closeIcon from '../svg/close';

const styles: Record<string, CSSInterpolation> = {
  container: {
    position: 'fixed',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    display: 'none',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    zIndex: 99999,
    borderWidth: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    '@media only screen and (max-width: 640px)': {
      alignItems: 'flex-end',
    },
  },
  containerShow: {
    display: 'flex',
  },
  containerHide: {
    display: 'none',
  },
  paper: {
    backgroundColor: 'white',
    borderWidth: '0',
    borderRadius: '8px',
    maxWidth: '320px',
    boxSizing: 'border-box',
    flexDirection: 'column',
    '@media only screen and (max-width: 640px)': {
      borderRadius: '0',
      maxWidth: 'initial',
      width: '100%',
    },
  },
  header: {
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#f9f9f9',
    height: '44px',
    padding: '0 8px',
  },

  headerButton: {
    cursor: 'pointer',
    padding: '4px',
    '&:active': {
      opacity: 0.3,
    },
  },
  content: {
    padding: '12px 24px',
  },
  message: {
    margin: '0',
    color: '#555559',
    textAlign: 'center',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'stretch',
    paddingLeft: '24px',
    paddingRight: '24px',
    paddingTop: '24px',
    paddingBottom: '32px',
  },
  button: {
    flex: '1',
    padding: '12px 24px',
    margin: '0 8px',
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    fontSize: '18px',
    cursor: 'pointer',
    '&:active': {
      opacity: 0.3,
    },
  },
  buttonCancel: {
    backgroundColor: 'white',
    color: '#ff9500',
    borderColor: '#ff9500',
  },

  buttonPrimary: {
    backgroundColor: '#ff9500',
    color: 'white',
    borderColor: '#ff9500',
  },
};

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
    rootDiv.className = css([styles.container, styles.containerHide]);
    rootDiv.onclick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
      onCancel?.();
    };

    const paperDiv = document.createElement('div');
    paperDiv.className = css(styles.paper);
    rootDiv.appendChild(paperDiv);

    const headerDiv = document.createElement('div');
    headerDiv.className = css(styles.header);
    paperDiv.appendChild(headerDiv);

    const closeSpan = document.createElement('span');
    closeSpan.className = css(styles.headerButton);
    closeSpan.innerHTML = closeIcon;
    closeSpan.onclick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
      onCancel?.();
    };
    headerDiv.appendChild(closeSpan);

    const contentDiv = document.createElement('div');
    contentDiv.className = css(styles.content);
    paperDiv.appendChild(contentDiv);

    const text = document.createElement('p');
    text.innerHTML = description;
    text.className = css(styles.message);

    contentDiv.appendChild(text);

    if (children) {
      contentDiv.appendChild(children);
    }

    const footerDiv = document.createElement('div');
    footerDiv.className = css(styles.footer);
    paperDiv.appendChild(footerDiv);

    if (cancelText && onCancel) {
      const cancelButton = this.createButton({
        innerHtml: cancelText,
        className: css(styles.button, styles.buttonCancel),
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
        className: css(styles.button, styles.buttonPrimary),
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
    this.element.className = css([styles.container, styles.containerHide]);
  };

  public show = (): void => {
    setTimeout(() => {
      this.element.className = css([styles.container, styles.containerShow]);
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
    button.className = className;
    button.onclick = onclick;
    return button;
  };
}
