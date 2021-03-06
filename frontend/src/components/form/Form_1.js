import React from 'react'
import {Form, Input, Button, Row, Col,DatePicker,TimePicker} from 'antd'
import {   Link } from 'react-router-dom'

import '../../css/Form.css'
import moment from 'moment'

const API_TOKEN = require('../../api/Token')
const API_ASSIGNMENT_STUDENT = require('../../api/Assignment_Student')
const API_ASSIGNMENT_ADMIN = require('../../api/Assignment_Admin')
const format = 'HH:mm'

class Form_1 extends React.Component {
    
    constructor(props){
        super(props)
        this.state = {
            defaultForm: 1,
            token_username: "",
            token_status: "student",
            readonly: "value",
            deadline: moment(),
            dateData:moment(),
            timeData:moment(),
            data:[],
            id:""
        }
    }



    onDateChange = (date)=>{
        this.setState({dateData:date})
        
    }


    getCurrentId = (year) => {
        console.log("defaultform",this.state.defaultForm,"year",year);
        
        let params = {defaultForm: this.state.defaultForm, year: parseInt(year)}
        API_ASSIGNMENT_ADMIN.POST_DEADLINE_DEFAULTFORM_YEAR(params)
        .then(response => {
            if(response.code === 1){
                console.log("Resss",response.data[0])
                let data = response.data[0]
                this.setState({dateData:moment(data.deadline),timeData:moment(data.deadline),id:data.id})
         

            }
        })
    }

    updateDeadline = () => {
        let newDeadline = this.state.dateData.set({'hour':this.state.timeData.hour(),'minute':this.state.timeData.minute()})
        console.log("newDeadline",newDeadline);
        
        let params = {id: this.state.id, year: parseInt(this.props.match.params.year), deadline: newDeadline}
        console.log("params",params);
        
        API_ASSIGNMENT_ADMIN.POST_UPDATE_DEADLINE_FORMREVIEW(params)
        .then(response => {
            if(response.code === 1){
                console.log("yeah!")
            }
        })
    }

    onTimeChange = (time) => {
        this.setState({timeData:time})
        console.log("time",moment(time));
        
    }


    POST_FORM_DATA = (username) => {
        let params = {username: username, defaultForm: this.state.defaultForm}
        const forms = this.props.form
        API_ASSIGNMENT_STUDENT.POST_FORM_DATA(params)
        .then(response => {
            if(response.code === 1){
                
                forms.setFieldsValue(response.data[0].formData)
                let readonlyVal = this.state.token_status === "admin"? "readOnly":"value"
                this.setState({readonly:readonlyVal,data:response.data[0]}) 
            }
        })
    }

    POST_CHECK_TOKEN = () => {
        let token = {'token': window.localStorage.getItem('token_senior_project')}
        API_TOKEN.POST_CHECK_TOKEN(token)
        .then(response => {
            let username = response.token_username
            let status = response.token_status
        
            if(status === "admin"){
                if(this.props.location.pathname.includes("/report/"))
                    this.POST_FORM_DATA(this.props.match.params.idStudent)
                else if(this.props.location.pathname.includes("/assignment/")){
                    
                    let readonlyVal = status === "admin"? "readOnly":"value"
                    console.log(readonlyVal);
                    this.getCurrentId(this.props.match.params.year)
                    this.setState({readonly:readonlyVal}) 
                }
                    
            }
            else if(status === "student"){
                this.POST_FORM_DATA(username)
            }

            this.setState({token_username: username, token_status: status})

        })
    }

    POST_UPDATE_FORM = (values) => {
        let params = {username: this.state.token_username, defaultForm: this.state.defaultForm, formData: values, status: 1, statusDescription: "turned in", submitDate: moment()}
        params["status"] = 1
        params["statusDescription"] = moment().isSameOrBefore(this.state.data.deadline)? "turned in":"late"
        API_ASSIGNMENT_STUDENT.POST_UPDATE_FORM(params)
        .then(response => {
            if(response.code === 1){
                // console.log(params);
                this.props.history.push("/assignment/assigned")
            }
        })
    }

    componentDidMount = () => {
        this.POST_CHECK_TOKEN()
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
          if (!err) {
            // console.log('Received values of form: ', values)
            this.POST_UPDATE_FORM(values)
          }
        })
    }

    render() {
        const { getFieldDecorator } = this.props.form
        return(
            <div className="container">
                <Row>
                    <Col span={30}>
                    {
                        (this.props.location.pathname.includes("/assignment/") && this.state.token_status==="admin")?
                        <div>
                        <span className="breadcrumb-admin"><Link style={{ textDecoration: 'none', color: 'rgb(0,0,0,0.65)',padding:'0px 3px' }} to="/admin/process/"> Process </Link> > <Link style={{ textDecoration: 'none', color: 'rgb(0,0,0,0.65)',padding:'0px 3px' }} to="/admin/process/assignment"> Assignment </Link> > ข้อมูลสถานประกอบการในโครงการสหกิจศึกษา มหาวิทยาลัยเกษตรศาสตร์</span><br/>
                        <span className="input-label">Assignment Deadline: </span>
                        <DatePicker ref="datePicker" selected={this.state.dateData} className="event-date datePicker" onChange={this.onDateChange} />
                        <span className="input-label">Time: </span>
                        <TimePicker ref="timePicker" selected={this.state.timeData} format={format}  onChange={this.onTimeChange}/> 
                        <Button className="update-deadline-form" onClick={this.updateDeadline}>Save an update</Button>
                        </div>
                       :
                       (this.props.location.pathname.includes("/report/") && this.state.token_status==="admin")?
                       <div>
                        <span className="breadcrumb-admin"><Link style={{ textDecoration: 'none', color: 'rgb(0,0,0,0.65)',padding:'0px 3px' }} to="/admin/process/">Process </Link> > <Link style={{ textDecoration: 'none', color: 'rgb(0,0,0,0.65)',padding:'0px 3px' }} to="/admin/process/report"> Assignment </Link> > ข้อมูลสถานประกอบการในโครงการสหกิจศึกษา มหาวิทยาลัยเกษตรศาสตร์ > {this.props.match.params.idStudent}</span><br/>
                        <span className="">Due {moment(this.state.data.deadline).format('llll')}</span>
                        <span className="status">status: {this.state.data.statusDescription}</span>
                        </div>
                   
                       : <div><span className="">Due {moment(this.state.data.deadline).format('llll')}</span>
                       <span className="status">status: {this.state.data.statusDescription}</span>
                           </div>
                    }
                   
                   <br/>
                   <br/>

                    <Form onSubmit={this.handleSubmit}>
                    <span><center><b><u>ข้อมูลสถานประกอบการในโครงการสหกิจศึกษา มหาวิทยาลัยเกษตรศาสตร์</u></b></center></span>
                    <br/>
                    <hr/>
                    <br/>
                    <span><b>ชื่อสถานประกอบการ (ที่เป็นทางการ)</b></span><br/><br/>
                    <span><b>ข้อมูลส่วนของนิสิต</b></span>
                    <Form.Item>
                        <span className="input-label">ชื่อ-นามสกุล(ภาษาไทย) </span>
                        {getFieldDecorator('f1_student_thaiFullName', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก ชื่อ-นามสกุล(ภาษาไทย)' }]})( <Input className="event-input" style={{width: '29%'}} placeholder="" />)}
                        <span className="input-label">ชื่อ-นามสกุล (ภาษาอังกฤษ) </span>
                        {getFieldDecorator('f1_student_engFullName', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก ชื่อ-นามสกุล(ภาษาอังกฤษ)' }]})( <Input className="event-input" style={{width: '29%'}} placeholder="" />)}
                    </Form.Item>
                    <Form.Item>
                        <span className="input-label">ที่อยู่ของนิสิต </span>
                        {getFieldDecorator('f1_student_address', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก ที่อยู่นิสิต' }],})( <Input className="event-input" style={{width: '84%'}}  placeholder="" />)}
                    </Form.Item>
                    <Form.Item>
                        <span className="input-label">รหัสไปรษณีย์ </span>
                        {getFieldDecorator('f1_student_postcode', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก รหัสไปรษณีย์' }],})( <Input className="event-input" style={{width: '20%'}}  placeholder="" />)}
                        <span className="input-label">เว็บไซต์หน่วยงาน (ถ้ามี) </span>
                        {getFieldDecorator('f1_student_website',{valuePropName:this.state.readonly, })( <Input className="event-input" style={{width: '30%'}}  placeholder="" />)}
                    </Form.Item>
                    <Form.Item>
                        <span className="input-label">หน่วยงานที่รับผิดชอบนิสิตสหกิจศึกษา </span>
                        {getFieldDecorator('f1_student_organization', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก หน่วยงานที่รับผิดชอบนิสิตสหกิจศึกษา' }],})( <Input className="event-input" style={{width: '70%'}}  placeholder="" />)}
                    </Form.Item>

                    <hr/>
                    <span><b>ข้อมูลส่วนของผู้ประสานงาน</b></span>
                    <Form.Item>
                        <span className="input-label">ชื่อผู้ประสานงาน </span>
                        {getFieldDecorator('f1_coordiator_thaiFullName', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก ชื่อผู้ประสานงาน' }],})( <Input className="event-input" style={{width: '36%'}}  placeholder="" />)}
                        <span className="input-label">ตำแหน่ง </span>
                        {getFieldDecorator('f1_coordiator_position', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก ตำแหน่ง' }],})( <Input className="event-input" style={{width: '36%'}}  placeholder="" />)}
                    </Form.Item>
                    <Form.Item>
                        <span className="input-label">ที่อยู่สถานที่ติดต่อ </span>
                        {getFieldDecorator('f1_coordiator_address', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก ที่อยู่สถานที่ติดต่อ' }],})( <Input className="event-input" style={{width: '81%'}}  placeholder="" />)}
                    </Form.Item>
                    <Form.Item>
                        <span className="input-label">รหัสไปรษณีย์ </span>
                        {getFieldDecorator('f1_coordiator_postcode', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก รหัสไปรษณีย์' }],})( <Input className="event-input" style={{width: '20%'}}  placeholder="" />)}
                        <span className="input-label">โทรศัพท์/โทรสาร </span>
                        {getFieldDecorator('f1_coordiator_phone', {rules: [{ required: true, message: 'กรุณากรอก โทรศัพท์/โทรสาร' }],})( <Input className="event-input" style={{width: '30%'}}  placeholder="" />)}
                    </Form.Item>
                    <Form.Item>
                        <span className="input-label">Email Address </span>
                        {getFieldDecorator('f1_coordiator_email', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก Email address' }],})( <Input className="event-input" style={{width: '35%'}}  placeholder="" />)}
                    </Form.Item>

                    <hr/>
                    <span><b>ข้อมูลส่วนของพนักงานที่ปรึกษา</b></span>
                    <Form.Item>
                        <span className="input-label">ชื่อผู้พนักงานที่ปรึกษา </span>
                        {getFieldDecorator('f1_supervisor_thaiFullName', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก ขื่อผู้พนักงานที่ปรึกษา' }],})( <Input className="event-input" style={{width: '36%'}}  placeholder="" />)}
                        <span className="input-label">ตำแหน่ง </span>
                        {getFieldDecorator('f1_supervisor_position', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก ตำแหน่ง' }],})( <Input className="event-input" style={{width: '36%'}}  placeholder="" />)}
                    </Form.Item>
                    <Form.Item>
                        <span className="input-label">ที่อยู่สถานที่ติดต่อ </span>
                        {getFieldDecorator('f1_supervisor_address', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก ที่อยู่สถานที่ติดต่อ' }],})( <Input className="event-input" style={{width: '81%'}}  placeholder="" />)}
                    </Form.Item>
                    <Form.Item>
                        <span className="input-label">รหัสไปรษณีย์ </span>
                        {getFieldDecorator('f1_supervisor_postcode', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก รหัสไปรษณีย์' }],})( <Input className="event-input" style={{width: '20%'}}  placeholder="" />)}
                        <span className="input-label">โทรศัพท์/โทรสาร </span>
                        {getFieldDecorator('f1_supervisor_phone', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก โทรศัพท์/โทรสาร' }],})( <Input className="event-input" style={{width: '30%'}}  placeholder="" />)}
                    </Form.Item>
                    <Form.Item>
                        <span className="input-label">E-mail </span>
                        {getFieldDecorator('f1_supervisor_email', {valuePropName:this.state.readonly, rules: [{ required: true, message: 'กรุณากรอก E-mail' }],})( <Input className="event-input" style={{width: '35%'}}  placeholder="" />)}
                    </Form.Item>


                    <br/><br/>
                    {
                        this.state.token_status === "student"?
                        <Form.Item>
                        <center>
                            <Button htmlType="submit">ยืนยันข้อมูล</Button><br/>
                            {/* <span>หมายเหตุ: ข้อมูลไม่สามารถแก้ภายหลังได้ กรุณาตรวจสอบข้อมูลก่อนยืนยันข้อมูล</span> */}
                        </center>
                        </Form.Item>:<div></div>
                    }
                  
                    </Form>
                    </Col>
                </Row>
            </div>
        )
    }

}

export default Form.create({ name: 'form_1' })(Form_1)