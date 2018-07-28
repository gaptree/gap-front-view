import {View} from '../index';

class UserView extends View {
    template() {
        return this.html`
        <div>$${'user.name'} - $${'user.address'}</div>
        `;
    }

    setAddress(address) {
        this.data.user.address = address;
    }
}

test('bind text', () => {
    const userView = new UserView();
    userView.appendTo(document.body);

    userView.update({
        user: {
            name: 'tom',
            address: 'china'
        }
    });

    expect(document.body.innerHTML).toBe('<div>tom - china</div>');

    userView.setAddress('shanghai');
    expect(document.body.innerHTML).toBe('<div>tom - shanghai</div>');
});
