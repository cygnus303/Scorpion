import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {

  constructor() { }

  private closeDropdowns() {
    try {
      // Blur the active element to trigger ng-select and other inputs to close/blur
      if (document.activeElement && typeof (document.activeElement as any).blur === 'function') {
        (document.activeElement as HTMLElement).blur();
      }
      
      // Dispatch a document-wide click event to force close any custom dropdowns (like ng-select)
      // that listen to document clicks
      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    } catch (e) {
      console.warn('Error closing dropdowns before alert:', e);
    }
  }

  success(message: string): Promise<any> {
    this.closeDropdowns();
    return Swal.fire({
      title: 'Success',
      html: `<div>${message}</div>`,
      icon: 'success',
      showConfirmButton: true,
      confirmButtonText: 'OK, Great!',
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#2c3e50',
      width: '420px',
      buttonsStyling: false,
      customClass: {
        popup: 'glassy-info-popup',
        title: 'glassy-info-title',
        htmlContainer: 'glassy-info-body',
        confirmButton: 'glassy-info-btn',
        icon: 'glassy-info-icon'
      }
    });
  }

  delete(message:string, onConfirm: () => void){
    this.closeDropdowns();
    Swal.fire({
      title: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#171829',
      cancelButtonColor: '#aaa',
      customClass: {
        container: 'notification-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm(); // 🔥 call the actual delete function
      }
    });
  }

  cancel(message:string, onConfirm: () => void){
    this.closeDropdowns();
    Swal.fire({
      title: message,
      icon: 'warning',
      width: '465px',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel!',
      cancelButtonText: 'No',
      confirmButtonColor: '#171829',
      cancelButtonColor: '#aaa',
      customClass: {
        popup: 'glassy-info-popup',
        title: 'glassy-info-title',
        htmlContainer: 'glassy-info-body',
        confirmButton: 'glassy-info-btn',
        cancelButton: 'glassy-info-btn',
        icon: 'glassy-info-icon',
        actions: 'glassy-info-actions'  // custom class for buttons container
      }
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm(); // 🔥 call the actual delete function
      }
    });
  }

  error(message:any){
    this.closeDropdowns();
    Swal.fire({
      icon: "error",
      text:`<div>${message}</div>`,
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#2c3e50',
      width: '420px',
      buttonsStyling: false,
    });
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: "Ok",
      confirmButtonColor: '#171829',
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#2c3e50',
      width: '420px',
      customClass: {
        popup: 'glassy-info-popup',
        title: 'glassy-info-title',
        htmlContainer: 'glassy-info-body',
        confirmButton: 'glassy-info-btn',
        icon: 'glassy-info-icon'
      }
    });
  }

  info(message: string, onConfirm?: () => void): void {
    this.closeDropdowns();
    Swal.fire({
      title: 'Information',
      html: `<div>${message}</div>`,
      icon: 'info',
      showConfirmButton: true,
      confirmButtonText: 'OK, Got It!',
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#2c3e50',
      width: '420px',
      buttonsStyling: false,
      customClass: {
        popup: 'glassy-info-popup',
        title: 'glassy-info-title',
        htmlContainer: 'glassy-info-body',
        confirmButton: 'glassy-info-btn',
        icon: 'glassy-info-icon'
      }
    }).then((result) => {
      if ((result.isConfirmed || result.dismiss) && onConfirm) {
        onConfirm();
      }
      if (result.isDismissed && onConfirm) {
        onConfirm();
      }
    });
  }

  warning(message: string): void {
    this.closeDropdowns();
    Swal.fire({
      title: 'Warning',
      html: `<div>${message}</div>`,
      icon: 'warning',
      showConfirmButton: true,
      confirmButtonText: 'OK, Got It!',
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#2c3e50',
      width: '420px',
      buttonsStyling: false,
      customClass: {
        popup: 'glassy-info-popup',
        title: 'glassy-info-title',
        htmlContainer: 'glassy-info-body',
        confirmButton: 'glassy-info-btn',
        icon: 'glassy-info-icon'
      }
    })
  }

  confirm(message: string, options?: any) {
    this.closeDropdowns();
    return Swal.fire({
      title: message,
      icon: 'warning',
      showCancelButton: true,
      allowOutsideClick: false,   // ⛔ block outside click
      allowEscapeKey: false, 
      confirmButtonText: options?.confirmButtonText || 'Yes',
      cancelButtonText: options?.cancelButtonText || 'No',
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#2c3e50',
      width: '420px',
      buttonsStyling: false,
      customClass: {
        popup: 'glassy-info-popup',
        title: 'glassy-info-title',
        htmlContainer: 'glassy-info-body',
        confirmButton: 'glassy-info-btn',
        cancelButton: 'glassy-info-btn',
        icon: 'glassy-info-icon',
        actions: 'glassy-info-actions'  // custom class for buttons container
      }
    });
  }

  cancelWithReason(title: string, entityLabel: string, onConfirm: (reason: string) => void, actionText: string = 'cancel', confirmBtnHtml: string = '<i class="fas fa-trash-alt me-1"></i> Yes, Cancel') {
    this.closeDropdowns();
    Swal.fire({
      html: `
        <div style="font-family: 'Inter', sans-serif; text-align: center; padding: 10px 0 0;">
          <div style="
            width: 72px; height: 72px; 
            background: #fee2e2; 
            border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; 
            margin: 0 auto 16px; 
            color: #dc2626; font-size: 40px;
            box-shadow: 0 4px 10px rgba(220, 38, 38, 0.15);">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3 style="color: #111827; font-weight: 700; margin-bottom: 8px; font-size: 22px;">
            ${title}
          </h3>
          <p style="color: #4b5563; font-size: 14.5px; margin-bottom: 20px; line-height: 1.5;">
            You are about to ${actionText} <b><span style="color: #dc2626;">${entityLabel}</span></b>.<br/>
            This action cannot be undone. Please provide a reason:
          </p>
          <div style="text-align: left;">
            <textarea id="swal-cancel-reason" 
              placeholder="E.g. Duplicate entry, wrong amount..." 
              style="
                width: 100%; 
                min-height: 95px; 
                padding: 12px 16px; 
                border: 2px solid #e5e7eb; 
                border-radius: 8px; 
                font-size: 14px; 
                color: #1f2937; 
                box-sizing: border-box; 
                resize: vertical;
                outline: none;
                background: #f9fafb;
                transition: all 0.2s ease;
              "
              onfocus="this.style.borderColor='#ef4444'; this.style.background='#ffffff'; this.style.boxShadow='0 0 0 3px rgba(239,68,68,0.1)';"
              onblur="this.style.borderColor='#e5e7eb'; this.style.background='#f9fafb'; this.style.boxShadow='none';"
            ></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: confirmBtnHtml,
      cancelButtonText: 'Keep it',
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn btn-danger px-4 py-2 fw-bold shadow-sm rounded-3',
        cancelButton: 'btn btn-light px-4 py-2 fw-bold text-dark border shadow-sm rounded-3',
        popup: 'rounded-4 shadow-lg border-0',
        actions: 'gap-3 mt-2'
      },
      showCloseButton: true,
      focusCancel: true,
      width: '460px',
      preConfirm: () => {
        const textarea = document.getElementById('swal-cancel-reason') as HTMLTextAreaElement;
        const reason = textarea ? textarea.value.trim() : '';
        if (!reason) {
          Swal.showValidationMessage(`Please enter a reason to ${actionText}`);
          if (textarea) {
            textarea.style.borderColor = '#ef4444';
            textarea.style.background = '#fef2f2';
          }
          return false;
        }
        return reason;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        onConfirm(result.value);
      }
    });
  }
}

