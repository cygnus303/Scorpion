import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class MobileNumberValidator {
static notSameConsignorConsignee(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const consignor = control.get('consignorMobile');
    const consignee = control.get('consigneeMobile');

    if (consignor && consignee && consignor.value && consignee.value && consignor.value === consignee.value) {
      consignee.setErrors({ ...(consignee.errors || {}), sameNumber: true });
    } else {
      if (consignee?.errors) {
        delete consignee.errors['sameNumber'];
        if (Object.keys(consignee.errors).length === 0) {
          consignee.setErrors(null);
        }
      }
    }

    return null;
  };
}


}
