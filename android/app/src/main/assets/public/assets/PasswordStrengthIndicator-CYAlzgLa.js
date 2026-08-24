import{c as s,j as l}from"./index-wBF3JTpr.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const a=[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]],i=s("lock",a),d=({password:o})=>{const e=(t=>{if(!t)return{label:"",color:"",width:"0%"};let r=0;switch(t.length>=8&&r++,/[A-Z]/.test(t)&&r++,/[0-9]/.test(t)&&r++,/[^A-Za-z0-9]/.test(t)&&r++,r){case 4:return{label:"Strong",color:"bg-green-500",width:"100%"};case 3:return{label:"Medium",color:"bg-yellow-500",width:"75%"};case 2:return{label:"Weak",color:"bg-red-500",width:"50%"};default:return{label:"Very Weak",color:"bg-red-600",width:"25%"}}})(o);return l.jsxs("div",{className:"mt-2 space-y-1",children:[l.jsx("div",{className:"h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden",children:l.jsx("div",{className:`h-full ${e.color} transition-all duration-300`,style:{width:e.width}})}),e.label&&l.jsxs("p",{className:`text-xs font-bold ${e.color.replace("bg-","text-")}`,children:["Strength: ",e.label]})]})};export{i as L,d as P};
//# sourceMappingURL=PasswordStrengthIndicator-CYAlzgLa.js.map
