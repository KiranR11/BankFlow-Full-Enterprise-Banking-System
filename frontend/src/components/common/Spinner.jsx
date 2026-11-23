export default function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 20 : size === 'lg' ? 60 : 36
  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'150px'}}>
      <div style={{width:s,height:s,border:'3px solid #e5e7eb',borderTopColor:'#2563eb',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/>
    </div>
  )
}