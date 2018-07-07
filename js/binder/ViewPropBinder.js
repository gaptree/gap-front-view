import {BinderBase} from './BinderBase';

export class ViewPropBinder extends BinderBase {
    constructor(viewBinder, prop) {
        super();

        this.viewBinder = viewBinder;
        this.prop = prop;
    }

    update(inVal) {
        this.viewBinder.updateProp(this.prop, inVal);
    }
}
