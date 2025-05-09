export async function POST(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const { unit, date, time, duration } = body;

    // Validate required fields
    if (!unit || !date || !time || !duration) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'All fields are required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate floor from unit number
    const floor = Math.floor(unit / 100);

    // Validate floor range (1-60)
    if (floor < 1 || floor > 60) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid unit floor. Only floors 1-60 are allowed.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Simulate availability check
    const available = time !== '12:00';

    if (!available) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Lift not available at this time.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Simulate successful booking
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lift booked successfully!',
        bookingDetails: {
          unit,
          floor,
          date,
          time,
          duration
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'An error occurred while processing your request.' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 