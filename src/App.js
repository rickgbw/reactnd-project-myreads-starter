import React from 'react'
import * as BooksAPI from './BooksAPI'
import './App.css'

import Book from './Book';

class BooksApp extends React.Component {
  state = {
    /**
     * TODO: Instead of using this state variable to keep track of which page
     * we're on, use the URL in the browser's address bar. This will ensure that
     * users can use the browser's back and forward buttons to navigate between
     * pages, as well as provide a good URL they can bookmark and share.
     */
    showSearchPage: false,

    currentlyReading: [],
    wantToRead: [],
    read: [],

    query: '',
    results: [],
  }

  move = (e, book) => {
    let oldShelf = book.shelf;
    let newShelf = e.target.value;

    BooksAPI.update(book,newShelf)
      .then(() => {
        book.shelf = newShelf;

        this.setState(prevState => {
          let obj = {};
          if(oldShelf !== 'none')
            obj = { [oldShelf]: prevState[oldShelf].filter(b => b.id !== book.id) };
          if(newShelf !== 'none')
            obj = { ...obj, [newShelf]: [...prevState[newShelf], book] };

          return obj;
        });
      });
  }

  handleSearch = ({ target: { value: query } }) => {
    this.setState({ query });

    if(query) {
      BooksAPI.search(query)
        .then(results => {
          let shelfs = ['currentlyReading', 'wantToRead', 'read'];

          results.forEach(book => {
            book.shelf = 'none';
            shelfs.forEach(shelf => {
              if(this.state[shelf].find(b => b.id === book.id))
                book.shelf = shelf;
            });
          });

          this.setState({ results });
        });
    } else {
      this.setState({
        searchResults: []
      });
    }
  };

  componentDidMount() {
    BooksAPI.getAll()
      .then(books => {
        this.setState({
          currentlyReading: books.filter(b => b.shelf === 'currentlyReading'),
          wantToRead: books.filter(b => b.shelf === 'wantToRead'),
          read: books.filter(b => b.shelf === 'read'),
        });
      });
  }

  render() {
    const { currentlyReading, wantToRead, read, query, results } = this.state;
    
    return (
      <div className="app">
        {this.state.showSearchPage ? (
          <div className="search-books">
            <div className="search-books-bar">
              <a className="close-search" onClick={() => this.setState({ showSearchPage: false })}>Close</a>
              <div className="search-books-input-wrapper">
                {/*
                  NOTES: The search from BooksAPI is limited to a particular set of search terms.
                  You can find these search terms here:
                  https://github.com/udacity/reactnd-project-myreads-starter/blob/master/SEARCH_TERMS.md

                  However, remember that the BooksAPI.search method DOES search by title or author. So, don't worry if
                  you don't find a specific author or title. Every search is limited by search terms.
                */}
                <input 
                  type="text" 
                  placeholder="Search by title or author"
                  value={query}
                  onChange={this.handleSearch}
                />

              </div>
            </div>
            <div className="search-books-results">
              <ol className="books-grid">
                {
                  results.map(book =>
                    <Book key={book.id} book={book} onMove={this.move} />
                  )
                }
              </ol>
            </div>
          </div>
        ) : (
          <div className="list-books">
            <div className="list-books-title">
              <h1>MyReads</h1>
            </div>
            <div className="list-books-content">
              <div>
                <div className="bookshelf">
                  <h2 className="bookshelf-title">Currently Reading</h2>
                  <div className="bookshelf-books">
                    <ol className="books-grid">
                      {
                        currentlyReading.map(book =>
                          <Book key={book.id} book={book} onMove={this.move} />
                        )
                      }
                    </ol>
                  </div>
                </div>
                <div className="bookshelf">
                  <h2 className="bookshelf-title">Want to Read</h2>
                  <div className="bookshelf-books">
                    <ol className="books-grid">
                      {
                        wantToRead.map(book =>
                          <Book key={book.id} book={book} onMove={this.move} />
                        )
                      }
                    </ol>
                  </div>
                </div>
                <div className="bookshelf">
                  <h2 className="bookshelf-title">Read</h2>
                  <div className="bookshelf-books">
                    <ol className="books-grid">
                      { read.map(book =>
                          <Book key={book.id} book={book} onMove={this.move} />
                        )
                      }
                    </ol>
                  </div>
                </div>
              </div>
            </div>
            <div className="open-search">
              <a onClick={() => this.setState({ showSearchPage: true })}>Add a book</a>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default BooksApp
