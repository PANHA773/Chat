<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;

class MessageController extends Controller
{
    // List all messages (GET /api/messages)
    public function index()
    {
        $messages = Message::orderBy('created_at')->get();
        return response()->json($messages);
    }

    // Store new message (POST /api/messages)
    public function store(Request $request)
    {
        $request->validate([
            'sender' => 'required|string',
            'text' => 'required|string',
        ]);

        $message = Message::create([
            'sender' => $request->sender,
            'text' => $request->text,
        ]);

        return response()->json($message, 201);
    }

    // Update message
public function update(Request $request, $id)
{
    $request->validate([
        'text' => 'required|string',
    ]);

    $message = Message::findOrFail($id);
    $message->text = $request->text;
    $message->save();

    return response()->json($message);
}

// Delete message
public function destroy($id)
{
    $message = Message::findOrFail($id);
    $message->delete();

    return response()->json(null, 204);
}

}
