export class ViewObserver {
    constructor(view) {
        this.view = view;
    }

    update(inVal) {
        this.view.update(inVal);
    }
}
