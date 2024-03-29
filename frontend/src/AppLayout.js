import React from 'react';
import { Link, IndexLink } from 'react-router';
import * as ReactRedux from 'react-redux';
import * as actions from './pages/Home.actions';

class AppLayout extends React.Component {

    render() {
        return (
            <div>
            {this.props.token ?
                <p className="userName">Hi, {this.props.first_name}</p> :
                <div></div>}

                <ul className="nav">
                    <li><IndexLink to="/" activeClassName="active">Home</IndexLink></li>
                    <li>{this.props.token ?
                        <Link onClick={this.props.logout} to="">Log Out</Link> :
                        <Link onClick={this.props.toggleLogin} to="">Log In</Link> }
                    </li>
                    <li><Link to="/signup" activeClassName="active">Sign Up</Link></li>

                    {this.props.shopping_cart.length > 0 ?
                        <div className="cart">
                            <Link to="/cart">
                                <img src="/shopping-cart.svg"></img>
                                <div>{this.props.shopping_cart.length}</div>
                            </Link>
                        </div> :
                        <div></div>}

                </ul>

                {this.props.showLogin ?
                    <div className="login">
                        Email: <input onChange={(event) => this.props.typing(event, 'email')} type="text"></input>
                        Password: <input onChange={(event) => this.props.typing(event, 'password')}type="password"></input>
                        <button onClick={()=> this.props.submitLogin(this.props.email, this.props.password)}>Submit</button>
                    </div> :
                    <h1 className="title">Welcome to Study Buddy</h1>}

                <div className="main">
                    {this.props.children}
                </div>

                <div className="footer">
                </div>
            </div>
        )
    }
}

const AppLayoutContainer = ReactRedux.connect(
    state => state,
    actions
)(AppLayout);

export default AppLayoutContainer;
