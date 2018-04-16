import React from 'react';
import classNames from 'classnames';
import Book from './Book';

class Shelf extends React.Component {
    state = { show: true };

    render() {
        let { show } = this.state;

        return (
            <div key={this.props.title} className="bookshelf">
                <div 
                    className="bookshelf-header"
                    onClick={() => this.setState({ show: !show })}
                >
                    <h2 className="bookshelf-title">{this.props.title}</h2>
                    <div
                    className={classNames('hamburger-shelf', { 'open-shelf': !show, 'close-shelf': show })}
                    ></div>
                </div>
                <div 
                    className={classNames('bookshelf-books', { 'bookshelf-books-close': !show })}
                >
                    <ol className="books-grid">
                    {
                        this.props.books
                        .filter(book => this.props.match.test(book.title))
                        .map(book =>
                            <Book key={book.id} book={book} onMove={this.props.onMove} />
                        )
                    }
                    </ol>
                </div>
            </div>
        );
    }
};

export default Shelf;