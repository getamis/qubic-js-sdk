interface Props {
  description: string;
  cancelText?: string;
  onCancel?: () => void;
  confirmText?: string;
  onConfirm?: () => void;
}

export default class Modal {
  public element: HTMLDivElement;

  constructor(props: Props) {
    const { description, onCancel, cancelText, onConfirm, confirmText } = props;

    const rootDiv = document.createElement('div');
    rootDiv.id = 'backdrop';
    rootDiv.style.display = 'none';
    rootDiv.style.position = 'fixed';
    rootDiv.style.top = '0';
    rootDiv.style.left = '0';
    rootDiv.style.right = '0';
    rootDiv.style.bottom = '0';
    rootDiv.style.zIndex = '99999';
    rootDiv.style.borderWidth = '0';
    rootDiv.style.width = '100%';
    rootDiv.style.height = '100%';
    rootDiv.style.background = 'rgba(0,0,0,.5)';
    rootDiv.style.alignItems = 'center';
    rootDiv.style.justifyContent = 'center';

    const paperDiv = document.createElement('div');
    paperDiv.id = 'paper';
    paperDiv.style.display = 'flex';
    paperDiv.style.backgroundColor = 'white';
    paperDiv.style.borderWidth = '0';
    paperDiv.style.maxWidth = '320px';
    paperDiv.style.boxSizing = 'border-box';
    paperDiv.style.alignItems = 'center';
    paperDiv.style.justifyContent = 'center';
    paperDiv.style.borderRadius = '8px';
    paperDiv.style.flexDirection = 'column';
    paperDiv.style.padding = '24px';
    rootDiv.appendChild(paperDiv);

    const text = document.createElement('p');
    text.innerHTML = description;
    text.style.marginBottom = '48px';
    text.style.color = '#555559';
    text.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    paperDiv.appendChild(text);

    const footerDiv = document.createElement('div');
    footerDiv.style.display = 'flex';
    footerDiv.style.flexDirection = 'row';
    footerDiv.style.alignSelf = 'stretch';
    footerDiv.style.marginLeft = '-8px';
    footerDiv.style.marginRight = '-8px';
    paperDiv.appendChild(footerDiv);

    if (cancelText && onCancel) {
      const cancelButton = this.createButton();
      cancelButton.innerHTML = cancelText;
      cancelButton.style.backgroundColor = 'white';
      cancelButton.style.color = '#ff9500';
      cancelButton.style.borderColor = '#ff9500';
      cancelButton.onclick = () => {
        this.hide();
        onCancel();
      };
      footerDiv.appendChild(cancelButton);
    }

    if (confirmText && onConfirm) {
      const okButton = this.createButton();
      okButton.innerHTML = confirmText;
      okButton.style.backgroundColor = '#ff9500';
      okButton.style.color = 'white';
      okButton.style.borderColor = '#ff9500';
      okButton.onclick = () => {
        this.hide();
        onConfirm();
      };
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

  private createButton = () => {
    const button = document.createElement('button');
    button.innerHTML = 'Yes';
    button.style.flex = '1';
    button.style.paddingRight = '24px';
    button.style.paddingLeft = '24px';
    button.style.paddingTop = '4px';
    button.style.paddingBottom = '4px';
    button.style.marginLeft = '8px';
    button.style.marginRight = '8px';
    button.style.borderRadius = '8px';
    button.style.borderWidth = '1px';
    button.style.borderStyle = 'solid';
    button.style.height = '48px';
    button.style.fontSize = '18px';
    button.style.cursor = 'pointer';

    button.style.backgroundColor = '#ff9500';
    button.style.color = 'white';
    button.style.borderColor = '#ff9500';
    return button;
  };
}
