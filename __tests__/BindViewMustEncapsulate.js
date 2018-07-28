import {View} from '../index';

class BookView extends View {
    template() {
        return this.html`
        <div>elem 1</div>
        <div>elem 2</div>
        `;
    }
}

test('view must encapsulated', () => {
    expect(() => {
        (new BookView()).appendTo(document.body);
    }).toThrowError(/must be encapsulated/);
});
