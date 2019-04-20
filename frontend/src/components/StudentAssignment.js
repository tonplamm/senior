import React from 'react'
import moment from 'moment'

import '../css/StudentAssignment.css';
import '../css/App.css'

import { Upload, Button, Icon, Input , Form, Row, Col} from 'antd'

const API_STUDENT = require('../api/Assignment_Student')
const API_TOKEN = require('../api/Token')
const { TextArea } = Input

// const props = {
//     name: 'file',
//     action: '//jsonplaceholder.typicode.com/posts/',
//     headers: {
//       authorization: 'authorization-text',
//     },
// onChange(info) {
//     if (info.file.status !== 'uploading') {
//       console.log(info.file, info.fileList);
//     }
//     if (info.file.status === 'done') {
//       message.success(`${info.file.name} file uploaded successfully`);
//     } else if (info.file.status === 'error') {
//       message.error(`${info.file.name} file upload failed.`);
//     }
//   },
// }

class StudentAssignment extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            token_username: "",
            token_firstname: "",
            token_lastname: "",
            token_status: "",
            data:[],
        }
    }

    API_POST_ID = (username, id) => {
        API_STUDENT.POST_ID(username, id)
        .then(response => {
            if(response.code === 1){
                console.log('response studentassi',response.data);
                this.setState({data:response.data[0]})
            }
        })
    }

    API_POST_UPDATE = (values) => {
        API_STUDENT.POST_UPDATE(values)
        .then(response => {
            if(response.code === 1){
                console.log(response)
            }
        })
    }

    POST_CHECK_TOKEN = () => {
        let token = {'token': window.localStorage.getItem('token_senior_project')}
        API_TOKEN.POST_CHECK_TOKEN(token)
        .then(response => {
            let username = response.token_username
            let firstname = response.token_firstname
            let lastname = response.token_lastname
            let status = response.token_status
            this.setState({token_username: username, token_firstname: firstname, token_lastname: lastname, token_status: status})
            this.API_POST_ID(this.state.token_username,this.props.match.params.idAssignment)
        })   
    }

    normFile = (e) => {
        if (Array.isArray(e)) {
          return e;
        }
        console.log(e.fileList)
        return e && e.fileList;
    }
    
    componentDidMount = () => {
        console.log("didmount");
        this.POST_CHECK_TOKEN()
    }

    componentDidUpdate = (prevProps,prevState) => {
        if(this.state.token_status !== prevState.token_status){
            console.log("token_change");
            this.POST_CHECK_TOKEN()
        }
        else if(this.props.match.params.idAssignment !== prevProps.match.params.idAssignment){
            console.log("params change");
            this.API_POST_ID(this.state.token_username,this.props.match.params.idAssignment)
        }
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
            console.log(values)
            this.state.data.formData.map((element) => {
                element.data = values[element.title]
            })
            console.log(this.state.data.formData)
            let params = this.state.data
               
            params["status"] = 1
            params["statusDescription"] = moment().isSameOrBefore(this.state.data.deadline)? "turned in":"late"
            params["submitDate"] = moment()
            params["formData"] = this.state.data.formData
           
            console.log(params)
            // this.API_POST_UPDATE(params)
          }
        })
      }

      getFormItem = () => {
        const { getFieldDecorator } = this.props.form
        console.log(this.state.data.formData)
        if(this.state.data.formData){
            const formItem = this.state.data.formData.map((element)=>
            <div>
            <span className="input-label">{element.title} : </span>
            {element.option === "short" || element.option === "multiple"?
                <Form.Item>
                 {getFieldDecorator(`${element.title}`, {
                     initialValue: element.data,
                     validateTrigger: ['onChange', 'onBlur'],
                     rules: [{
                     required: false,
                     whitespace: true,
                     message: "You have to input something",
                     }],
                 })(
                     element.option === "short"?  
                     <Input className="question event-input" placeholder={element.title} /> :
                     <TextArea className="event-input" placeholder={element.title} onBlur={this.handleConfirmBlur}  autosize />
                 )}
               </Form.Item>:
              <Form.Item>
                {getFieldDecorator(`${element.title}`, {
                    valuePropName: 'fileList',
                    getValueFromEvent: this.normFile,
                })(
                    <Upload name="logo" listType="picture">
                    <Button>
                        <Icon type="upload" /> Click to upload
                    </Button>
                    </Upload>
                )}
              </Form.Item>}
            </div>
            )
          return formItem
        }
        return <div></div>
      }

    render() {
        return (
            <div className="container">
                <span className="breadcrumb-admin">Assignment > {this.state.data.assignmentName} </span><br/>
                <span className="">Due {moment(this.state.data.deadline).format('llll')}</span>
                <span className="status">status: {this.state.data.status===0?"not submit":"submitted"}</span>
                <br/><br/>
                <span className="assignment-title bold">{this.state.data.assignmentName}</span>
                <br/><br/>
    
                <span className="bold description">Description</span>
                <span>{this.state.data.assignmentDescription}</span>
                <br/>
                <Row>
                    <Col span={16}>
                        <Form onSubmit={this.handleSubmit}>
                            {this.getFormItem()}
                            <br/><br/>
                            <Form.Item>
                                <Button htmlType="submit" className="submit-btn">Submit Assignment</Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </div>
        )
    }
    
}

export default Form.create({ name: 'std_assignment' })(StudentAssignment)

