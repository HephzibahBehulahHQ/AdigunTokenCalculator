export function mountBacGate({panel,form,consent,checkbox,copy,onCancel}){
  form.hidden=true;
  form.dataset.bacApproved="false";
  checkbox.checked=false;

  const dialog=document.createElement("dialog");
  dialog.className="bac-dialog";
  const heading=document.createElement("h2");
  heading.id="bac-gate-title";
  heading.tabIndex=-1;
  heading.autofocus=true;
  heading.textContent=copy.title;
  dialog.setAttribute("aria-labelledby",heading.id);
  const warning=consent.querySelector(".warning-text");
  if(warning){warning.id="bac-gate-warning";dialog.setAttribute("aria-describedby",warning.id);}

  const actions=document.createElement("div");
  actions.className="actions";
  const cancel=document.createElement("button"),proceed=document.createElement("button");
  cancel.type=proceed.type="button";
  cancel.className="secondary";proceed.className="primary";
  cancel.dataset.bacAction="cancel";proceed.dataset.bacAction="continue";
  cancel.textContent=copy.cancelLabel;proceed.textContent=copy.continueLabel;
  const syncContinue=()=>{proceed.disabled=!checkbox.checked;};
  checkbox.addEventListener("change",syncContinue);
  syncContinue();

  const dismiss=()=>{
    dialog.close();
    dialog.remove();
    onCancel();
  };
  cancel.addEventListener("click",dismiss);
  dialog.addEventListener("cancel",event=>{event.preventDefault();dismiss();});
  proceed.addEventListener("click",()=>{
    if(!checkbox.checked)return;
    checkbox.removeEventListener("change",syncContinue);
    form.insertBefore(consent,form.lastElementChild);
    form.dataset.bacApproved="true";
    form.hidden=false;
    dialog.close();
    dialog.remove();
    form.querySelector('input[name="weightKg"]')?.focus();
  });
  actions.append(cancel,proceed);
  dialog.append(heading,consent,actions);
  panel.append(dialog);
  dialog.showModal();
  heading.focus();
}
