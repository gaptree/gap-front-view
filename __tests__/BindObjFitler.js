import {View} from '../index';

class UserView extends View {
    template() {
        return this.html`
        <span
            bind-class=${{user: user => this.getClass(user)}}
        >
            $${'user.role'}
            -
            $${{user: user => this.getSex(user)}}
            -
            $${{'user.age': age => this.getAge(age)}}
        </span>
        `;
    }

    getClass(user) {
        if (user.role === 1) {
            return 'admin';
        }

        return 'normal';
    }

    getSex(user) {
        if (user.sex === 1) {
            return 'male';
        }
        return 'female';
    }

    getAge(age) {
        if (age > 18) {
            return 'old';
        }
        return 'young';
    }
}

test('bind obj filter', () => {
    const userView = new UserView();
    userView.appendTo(document.body);

    userView.update({
        user: {
            role: 1,
            age: 18,
            sex: 1
        }
    });

    expect(document.body.innerHTML.trim())
        .toBe('<span class="admin"> 1 - male - young </span>');

    userView.update({
        user: {
            role: 0,
            age: 20,
            sex: 2
        }
    });
    expect(document.body.innerHTML.trim())
        .toBe('<span class="normal"> 0 - female - old </span>');

});
