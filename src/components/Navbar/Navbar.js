import React, { Component } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { BrowserRouter } from 'react-router-dom'
import { Navbar, Nav, NavItem, Modal, Button, Table } from 'react-bootstrap'
import { connect } from 'react-redux'
import * as actionTypes from '../../store/actions'
import axios from 'axios'


class Navigation extends Component {

    state = {
        showCart: true
    }

    showCart = () => {
       this.setState({ showCart: true });
    }

    hideCart = () => {
        this.setState({ showCart: false });
    }

    checkout = () => {
        let newQuantity;
        let cart_product_ids = this.props.cart.map((product) => product.id)
        console.log(cart_product_ids)
        console.log(this.props.cart)
        axios({
            method: 'post',
            url: 'https://infinite-brushlands-33577.herokuapp.com/orders',
            data: { user_id: 1 },
            headers: { 'Authorization': this.props.token }
        })
        .then((response) => {
            console.log(response)
            let orderID = response.data.id
            console.log("Order ID:" + orderID)
            this.props.cart.forEach((item, index) => {
                let cart_quantity = cart_product_ids.filter((productID) => productID === item.id).length
                axios({
                    method: 'post',
                    url: 'https://infinite-brushlands-33577.herokuapp.com/order_line_items',
                    data: { 
                        product_id: item.id,
                        order_id: orderID,
                        product_name: item.product_name,
                        price: item.price
                     },
                    headers: { 'Authorization': this.props.token }
                })
                .then(() => {
                    axios({
                        method: 'get',
                        url: 'https://infinite-brushlands-33577.herokuapp.com/products/' + item.id,
                        headers: { 'Authorization': this.props.token }
                    })
                    .then((response) => {
                        console.log(response.data.quantity)
                        newQuantity = response.data.quantity
                        axios({
                            method: 'patch',
                            url: 'https://infinite-brushlands-33577.herokuapp.com/products/' + item.id,
                            data: { quantity: newQuantity - cart_quantity },
                            headers: { 'Authorization': this.props.token }
                        })
                        .then(() => {
                            axios({
                                method: 'get',
                                url: 'https://infinite-brushlands-33577.herokuapp.com/products/',
                                headers: { 'Authorization': this.props.token }
                            })
                            .then((response) => {
                                let newProductsArr = response.data
                                this.props.updateProduct(newProductsArr)
                            })
                        })
                    })
                })    
            })
        })
        .then(() => {
            this.props.clearCart()
            this.setState({ showCart: false })
        })
    }

    render() {
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        return (
            <div> 
                <Navbar bg="dark" variant="dark">
                       <Navbar.Brand>
                            <a>Inventory Manager</a>
                        </Navbar.Brand>
                        <Navbar.Toggle />
                    <Navbar.Collapse>
                        <Nav>
                            {this.props.isAuthed ?
                            <LinkContainer eventKey={1} onClick={this.props.showChart}>
                                <NavItem >Sales Chart</NavItem>
                            </LinkContainer>
                            : null}
                            {this.props.isAuthed ?
                            <LinkContainer eventKey={1} onClick={this.showCart}>
                                <NavItem>Cart ({this.props.cart.length})</NavItem>
                            </LinkContainer>
                            : null}
                            {this.props.isAuthed ?
                            <LinkContainer eventKey={2} onClick={this.props.login}>
                                <NavItem>Login</NavItem>
                            </LinkContainer>
                            : null}
                            {this.props.isAuthed ?
                            <LinkContainer eventKey={3} onClick={this.props.logout}>
                                <NavItem>Logout</NavItem>
                            </LinkContainer>
                            : null}
                            {this.props.isAuthed ?
                            <LinkContainer eventKey={3} onClick={this.props.createAccount}>
                                <NavItem>Create Account</NavItem>
                            </LinkContainer>
                            : null}
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
               
                {this.state.showCart ? 
                    <div className="static-modal">
                            <Modal.Dialog style={{ overflowY: 'initial'}}>
                            <Modal.Header>
                                <Modal.Title>Your Cart</Modal.Title>
                            </Modal.Header>
                                <Modal.Body style={{ textAlign: 'left', overflowY: 'auto', height: 500}}>
                                {this.props.cart.length === 0 ? <h2>No products in cart.</h2> :
                                <Table striped bordered condensed hover>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Product Name</th>
                                            <th>Price</th>
                                            <th>Remove From Cart</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.props.cart.map((item, index) => {
                                            return <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.product_name}</td>
                                                <td>${item.price}</td>
                                                <td style={{textAlign: 'center'}}><Button bsSize="small" bsStyle="danger" onClick={() => {
                                                    console.log("Delete " + item)
                                                    this.props.removeFromCart(index)
                                                }}>Remove</Button></td>
                                            </tr>
                                        })}
                                        <tr>
                                            <td></td>
                                            <td><strong>Total:</strong></td>
                                                    <td><strong>${this.props.cart.map(item => item.price).reduce(reducer).toFixed(2)}</strong></td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </Table>}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button onClick={this.hideCart}>Close</Button>
                                <Button bsStyle="primary" onClick={this.checkout}>Checkout</Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </div>
                : null}
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        isAuthed: state.auth.isAuthed,
        cart: state.auth.cart,
        token: state.auth.token
    }
}

const mapDispatchToProps = dispatch => {
    return {
        login: () => dispatch(actionTypes.showLogin()),
        logout: () => dispatch(actionTypes.authLogout()),
        createAccount: () => dispatch(actionTypes.showCreateAccount()),
        removeFromCart: (index) => dispatch(actionTypes.removeFromCart(index)),
        clearCart: () => dispatch(actionTypes.clearCart()),
        updateProduct: (products) => dispatch(actionTypes.editProduct(products)),
        showChart: () => dispatch(actionTypes.showChart())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigation)


